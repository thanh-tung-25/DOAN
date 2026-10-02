let danhSachBillNhanVien = [];

async function taiDanhSachHoaDonNV() {
    try {
        const res = await window.GoiAPI.get('/hoa-don');
        danhSachBillNhanVien = res.du_lieu || [];
        const tbody = document.getElementById('bang-nhan-vien-bill');
        if (!tbody) return;

        if (danhSachBillNhanVien.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Chưa có hóa đơn nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSachBillNhanVien.map(hd => `
            <tr>
                <td><strong>${hd.ma_phong}</strong></td>
                <td>Tháng ${hd.thang}/${hd.nam}</td>
                <td>${hd.chi_so_dien_cu} ➔ ${hd.chi_so_dien_moi}</td>
                <td>${hd.chi_so_nuoc_cu} ➔ ${hd.chi_so_nuoc_moi}</td>
                <td><strong style="color:var(--mau-chinh);">${window.DinhDang.tienVND(hd.tong_tien)}</strong></td>
                <td><span class="nhan-trang-thai trang-thai-${hd.trang_thai}">${hd.trang_thai}</span></td>
                <td>
                    <div class="nhom-nut-thuc-dia">
                        ${hd.trang_thai !== 'da_thanh_toan' ? `
                            <button class="nut-thanh-cong" onclick="thuTienMat(${hd.id})">💵 Thu tiền mặt</button>
                        ` : `
                            <button class="nut-phu" onclick="moModalInBienLai(${hd.id})">🖨️ In biên lai</button>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        window.hienThongBao('Lỗi tải bill: ' + e.message, 'loi');
    }
}

async function thuTienMat(idHoaDon) {
    const xacNhan = confirm('Xác nhận khách thuê đã giao đủ tiền mặt tại cửa phòng? Hệ thống sẽ ghi nhận lịch sử Audit Log để chủ trọ đối soát.');
    if (!xacNhan) return;

    try {
        await window.GoiAPI.post('/hoa-don/xac-nhan-thanh-toan', {
            idHoaDon,
            hinhThucThanhToan: 'tien_mat',
            chapNhan: true
        });
        window.hienThongBao('Đã xác nhận thu tiền mặt và ghi vết Audit Log thành công!', 'thanh_cong');
        taiDanhSachHoaDonNV();
    } catch (loi) {
        window.hienThongBao('Lỗi thu tiền mặt: ' + loi.message, 'loi');
    }
}

function moModalInBienLai(idHoaDon) {
    const hd = danhSachBillNhanVien.find(h => h.id === idHoaDon);
    if (!hd) return;

    document.getElementById('in-phong').textContent = hd.ma_phong;
    document.getElementById('in-khach').textContent = hd.ten_khach;
    document.getElementById('in-ky').textContent = `Tháng ${hd.thang}/${hd.nam}`;
    document.getElementById('in-tien').textContent = window.DinhDang.tienVND(hd.tong_tien);
    document.getElementById('in-gio').textContent = new Date().toLocaleString('vi-VN');

    document.getElementById('modal-in-bien-lai').style.display = 'flex';
}

function dongModalIn() {
    document.getElementById('modal-in-bien-lai').style.display = 'none';
}

window.thuTienMat = thuTienMat;
window.moModalInBienLai = moModalInBienLai;
window.dongModalIn = dongModalIn;

document.addEventListener('DOMContentLoaded', taiDanhSachHoaDonNV);
