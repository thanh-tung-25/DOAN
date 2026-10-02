let dsHoaDonKhach = [];
let idHoaDonDangGuiBill = null;

async function taiDanhSachHoaDonKhach() {
    try {
        const res = await window.GoiAPI.get('/hoa-don');
        dsHoaDonKhach = res.du_lieu || [];
        const tbody = document.getElementById('bang-hoa-don-khach');
        if (!tbody) return;

        if (dsHoaDonKhach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Bạn không có hóa đơn nào</td></tr>';
            return;
        }

        tbody.innerHTML = dsHoaDonKhach.map(hd => {
            const tieuThuDien = Number(hd.chi_so_dien_moi) - Number(hd.chi_so_dien_cu);
            const tieuThuNuoc = Number(hd.chi_so_nuoc_moi) - Number(hd.chi_so_nuoc_cu);

            return `
                <tr>
                    <td><strong>Tháng ${hd.thang}/${hd.nam}</strong></td>
                    <td>${window.DinhDang.tienVND(hd.tien_phong)}</td>
                    <td>${tieuThuDien} kWh (${window.DinhDang.tienVND(hd.tien_dien)})</td>
                    <td>${tieuThuNuoc} m³ (${window.DinhDang.tienVND(hd.tien_nuoc)})</td>
                    <td><strong style="color:var(--mau-chinh); font-size:15px; font-weight:700;">${window.DinhDang.tienVND(hd.tong_tien)}</strong></td>
                    <td><span class="nhan-trang-thai trang-thai-${hd.trang_thai}">${hd.trang_thai}</span></td>
                    <td>
                        <button class="nut-chinh" style="font-size:11px;" onclick="moModalVietQRKhach(${hd.id})">📲 Quét VietQR</button>
                    </td>
                    <td>
                        ${hd.trang_thai !== 'da_thanh_toan' ? `
                            <button class="nut-phu" style="font-size:11px;" onclick="moModalGuiBill(${hd.id})">📤 Gửi bill</button>
                        ` : '<span style="color:#10b981; font-weight:700;">✓ Đã duyệt</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải hóa đơn: ' + loi.message, 'loi');
    }
}

function moModalVietQRKhach(idHoaDon) {
    const hd = dsHoaDonKhach.find(h => h.id === idHoaDon);
    if (!hd) return;

    document.getElementById('img-vietqr-khach').src = hd.linkVietQR;
    const vungChia = document.getElementById('danh-sach-chia-khach');
    const dsc = hd.danhSachChiaBill || [];

    if (dsc.length === 0) {
        vungChia.innerHTML = '<p style="font-size:12px; color:#64748b;">Hóa đơn thanh toán nguyên phòng (Chưa chia lẻ).</p>';
    } else {
        vungChia.innerHTML = dsc.map(c => `
            <div class="muc-chia-tien">
                <span><strong>${c.ho_ten}</strong>: ${window.DinhDang.tienVND(c.so_tien)}</span>
                <a href="${c.ma_vietqr}" target="_blank" class="nut-phu" style="font-size:11px;">Mở QR cá nhân</a>
            </div>
        `).join('');
    }

    document.getElementById('modal-vietqr-khach').style.display = 'flex';
}

function dongModalVietQRKhach() {
    document.getElementById('modal-vietqr-khach').style.display = 'none';
}

function moModalGuiBill(idHoaDon) {
    idHoaDonDangGuiBill = idHoaDon;
    document.getElementById('modal-gui-bill').style.display = 'flex';
}

function dongModalGuiBill() {
    document.getElementById('modal-gui-bill').style.display = 'none';
}

async function xacNhanGuiBill() {
    try {
        await window.GoiAPI.post('/hoa-don/tai-bien-lai', {
            idHoaDon: idHoaDonDangGuiBill,
            duongDanAnh: '/tai_nguyen_dung_chung/hinh_anh/bien_lai_chuyen_khoan_mau.jpg'
        });
        window.hienThongBao('Đã gửi ảnh biên lai thành công! Vui lòng chờ chủ trọ duyệt gạch nợ.', 'thanh_cong');
        dongModalGuiBill();
        taiDanhSachHoaDonKhach();
    } catch (loi) {
        window.hienThongBao('Lỗi gửi bill: ' + loi.message, 'loi');
    }
}

window.moModalVietQRKhach = moModalVietQRKhach;
window.dongModalVietQRKhach = dongModalVietQRKhach;
window.moModalGuiBill = moModalGuiBill;
window.dongModalGuiBill = dongModalGuiBill;
window.xacNhanGuiBill = xacNhanGuiBill;

document.addEventListener('DOMContentLoaded', taiDanhSachHoaDonKhach);
