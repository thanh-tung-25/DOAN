let danhSachHoaDon = [];
let danhSachHopDong = [];
let hoaDonDangChon = null;
let hopDongDangChon = null;

async function taiDanhSachHoaDon() {
    try {
        const res = await window.GoiAPI.get('/hoa-don');
        danhSachHoaDon = res.du_lieu || [];
        const tbody = document.getElementById('bang-hoa-don');
        if (!tbody) return;

        if (danhSachHoaDon.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Chưa có hóa đơn nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSachHoaDon.map(hd => {
            const tieuThuDien = Number(hd.chi_so_dien_moi) - Number(hd.chi_so_dien_cu);
            const tieuThuNuoc = Number(hd.chi_so_nuoc_moi) - Number(hd.chi_so_nuoc_cu);
            const canhBaoX3 = hd.canh_bao_bat_thuong === 1;

            return `
                <tr>
                    <td><strong>Tháng ${hd.thang}/${hd.nam}</strong></td>
                    <td><strong>${hd.ma_phong}</strong> (${hd.ten_khach})</td>
                    <td>${tieuThuDien} kWh <small>(${hd.chi_so_dien_cu} ➔ ${hd.chi_so_dien_moi})</small></td>
                    <td>${tieuThuNuoc} m³ <small>(${hd.chi_so_nuoc_cu} ➔ ${hd.chi_so_nuoc_moi})</small></td>
                    <td><strong style="color:var(--mau-chinh); font-weight:700;">${window.DinhDang.tienVND(hd.tong_tien)}</strong></td>
                    <td>
                        ${canhBaoX3 ? `
                            <span class="canh-bao-ro-ri-do" title="Chỉ số tăng đột biến gấp 3 lần so với trung bình 3 tháng gần nhất!">⚠️ Đột biến x3</span>
                        ` : '<span style="color:#10b981;">Bình thường</span>'}
                    </td>
                    <td><span class="nhan-trang-thai trang-thai-${hd.trang_thai}">${hd.trang_thai}</span></td>
                    <td>
                        <button class="nut-phu" onclick="moModalVietQR(${hd.id})">📲 QR & Chia bill</button>
                    </td>
                    <td>
                        <div style="display:flex; gap:4px; align-items:center;">
                            ${hd.anh_bien_lai ? `
                                <button class="nut-thanh-cong" style="font-size:11px; padding:4px 6px;" onclick="xacNhanDuyetBill(${hd.id})">👁️ Duyệt</button>
                            ` : (hd.trang_thai === 'da_thanh_toan' ? '<small style="color:#10b981; font-weight:600;">✓ Đã thu</small>' : '<small style="color:#64748b;">Chưa thu</small>')}
                            <button class="nut-nguy-hiem" style="font-size:11px; padding:4px 6px; border-radius:4px; cursor:pointer;" onclick="xoaHoaDon(${hd.id})">Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải hóa đơn: ' + loi.message, 'loi');
    }
}

async function moModalLapHoaDon() {
    document.getElementById('modal-lap-bill').style.display = 'flex';
    try {
        const res = await window.GoiAPI.get('/hop-dong');
        danhSachHopDong = res.du_lieu || [];
        const sel = document.getElementById('bill-hop-dong');
        if (sel) {
            sel.innerHTML = danhSachHopDong.map(h => `<option value="${h.id}">${h.ma_phong} - HĐ: ${h.ma_hop_dong} (${h.ten_khach})</option>`).join('');
            sel.onchange = capNhatGiaTheoHopDong;
            capNhatGiaTheoHopDong();
        }
    } catch (e) {
        console.error(e);
    }
}

function capNhatGiaTheoHopDong() {
    const sel = document.getElementById('bill-hop-dong');
    if (!sel) return;
    const idHD = sel.value;
    hopDongDangChon = danhSachHopDong.find(h => String(h.id) === String(idHD)) || null;
    tinhTienThoiGianThuc();
}

function tinhTienThoiGianThuc() {
    const dienCu = Number(document.getElementById('bill-dien-cu')?.value || 0);
    const dienMoi = Number(document.getElementById('bill-dien-moi')?.value || 0);
    const nuocCu = Number(document.getElementById('bill-nuoc-cu')?.value || 0);
    const nuocMoi = Number(document.getElementById('bill-nuoc-moi')?.value || 0);

    const tieuThuDien = Math.max(0, dienMoi - dienCu);
    const tieuThuNuoc = Math.max(0, nuocMoi - nuocCu);

    const donGiaDien = 3500;
    const donGiaNuoc = 20000;
    const phiDichVu = 100000;
    const tienPhong = hopDongDangChon ? Number(hopDongDangChon.gia_thue) : 3500000;

    const tienDien = tieuThuDien * donGiaDien;
    const tienNuoc = tieuThuNuoc * donGiaNuoc;
    const tongTien = tienPhong + tienDien + tienNuoc + phiDichVu;

    const elTienPhong = document.getElementById('pv-tien-phong');
    const elTieuThuDien = document.getElementById('pv-tieu-thu-dien');
    const elDonGiaDien = document.getElementById('pv-don-gia-dien');
    const elTienDien = document.getElementById('pv-tien-dien');
    const elTieuThuNuoc = document.getElementById('pv-tieu-thu-nuoc');
    const elDonGiaNuoc = document.getElementById('pv-don-gia-nuoc');
    const elTienNuoc = document.getElementById('pv-tien-nuoc');
    const elPhiDV = document.getElementById('pv-phi-dv');
    const elTongCong = document.getElementById('pv-tong-cong');

    if (elTienPhong) elTienPhong.textContent = window.DinhDang.tienVND(tienPhong);
    if (elTieuThuDien) elTieuThuDien.textContent = `${tieuThuDien} kWh`;
    if (elDonGiaDien) elDonGiaDien.textContent = window.DinhDang.tienVND(donGiaDien);
    if (elTienDien) elTienDien.textContent = window.DinhDang.tienVND(tienDien);
    if (elTieuThuNuoc) elTieuThuNuoc.textContent = `${tieuThuNuoc} m³`;
    if (elDonGiaNuoc) elDonGiaNuoc.textContent = window.DinhDang.tienVND(donGiaNuoc);
    if (elTienNuoc) elTienNuoc.textContent = window.DinhDang.tienVND(tienNuoc);
    if (elPhiDV) elPhiDV.textContent = window.DinhDang.tienVND(phiDichVu);
    if (elTongCong) elTongCong.textContent = window.DinhDang.tienVND(tongTien);
}

function dongModalLapBill() {
    document.getElementById('modal-lap-bill').style.display = 'none';
}

async function xuLyLapBill(e) {
    e.preventDefault();
    const idHopDong = document.getElementById('bill-hop-dong').value;
    const thang = document.getElementById('bill-thang').value;
    const nam = document.getElementById('bill-nam').value;
    const chiSoDienCu = document.getElementById('bill-dien-cu').value;
    const chiSoDienMoi = document.getElementById('bill-dien-moi').value;
    const chiSoNuocCu = document.getElementById('bill-nuoc-cu').value;
    const chiSoNuocMoi = document.getElementById('bill-nuoc-moi').value;

    try {
        const res = await window.GoiAPI.post('/hoa-don/lap-hoa-don', {
            idHopDong, thang, nam, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi
        });

        if (res.du_lieu.canhBaoBatThuong) {
            alert('CẢNH BÁO BẤT THƯỜNG: Chỉ số điện hoặc nước của phòng này tăng đột biến gấp 3 lần so với trung bình 3 tháng gần nhất! Hệ thống đã gắn nhãn cảnh báo viền đỏ.');
        }

        window.hienThongBao('Lập hóa đơn và tính tiền thật thành công!', 'thanh_cong');
        dongModalLapBill();
        taiDanhSachHoaDon();
    } catch (loi) {
        window.hienThongBao('Lỗi lập bill: ' + loi.message, 'loi');
    }
}

function moModalVietQR(idHoaDon) {
    hoaDonDangChon = danhSachHoaDon.find(h => h.id === idHoaDon);
    if (!hoaDonDangChon) return;

    document.getElementById('img-qr-dong').src = hoaDonDangChon.linkVietQR;
    hienThiChiaBill(hoaDonDangChon.danhSachChiaBill || []);
    document.getElementById('modal-vietqr').style.display = 'flex';
}

function dongModalVietQR() {
    document.getElementById('modal-vietqr').style.display = 'none';
}

function hienThiChiaBill(danhSach) {
    const vung = document.getElementById('danh-sach-chia-bill-render');
    if (!vung) return;

    if (danhSach.length === 0) {
        vung.innerHTML = '<p style="font-size:12px; color:#64748b; margin-top:8px;">Chưa chia bill cho hóa đơn này. Nhập tên các bạn cùng phòng ở trên rồi bấm "Chia tiền ngay".</p>';
        return;
    }

    vung.innerHTML = danhSach.map(c => `
        <div class="item-chia-bill" style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:10px; border-radius:6px; margin-top:8px;">
            <div>
                <strong>${c.ho_ten}</strong>: <span style="color:var(--mau-chinh); font-weight:700;">${window.DinhDang.tienVND(c.so_tien)}</span><br>
                <small class="nhan-trang-thai trang-thai-${c.trang_thai}">${c.trang_thai === 'da_thanh_toan' ? 'Đã thanh toán' : 'Chưa đóng'}</small>
            </div>
            <div>
                <a href="${c.ma_vietqr}" target="_blank" class="nut-phu" style="font-size:11px; text-decoration:none;">Xem VietQR riêng</a>
            </div>
        </div>
    `).join('');
}

async function thucHienChiaBillCampuchia() {
    if (!hoaDonDangChon) return;
    const inputTen = document.getElementById('nhap-ten-nguoi-chia');
    const rawTen = inputTen ? inputTen.value.trim() : '';

    let danhSachNguoiChia = [];
    if (rawTen) {
        danhSachNguoiChia = rawTen.split(',').map(t => ({ hoTen: t.trim() })).filter(x => x.hoTen);
    } else {
        danhSachNguoiChia = [
            { hoTen: hoaDonDangChon.ten_khach || 'Khách chính' },
            { hoTen: 'Bạn cùng phòng' }
        ];
    }

    if (danhSachNguoiChia.length === 0) {
        window.hienThongBao('Vui lòng nhập ít nhất 1 người để chia bill!', 'canh_bao');
        return;
    }

    try {
        const res = await window.GoiAPI.post('/hoa-don/chia-bill-campuchia', {
            idHoaDon: hoaDonDangChon.id,
            danhSachNguoiChia
        });
        window.hienThongBao(`Đã chia bill thành công cho ${danhSachNguoiChia.length} người!`, 'thanh_cong');
        hienThiChiaBill(res.du_lieu || []);
        taiDanhSachHoaDon();
    } catch (loi) {
        window.hienThongBao('Lỗi chia bill: ' + loi.message, 'loi');
    }
}

async function xacNhanDuyetBill(idHoaDon) {
    const xacNhan = confirm('Bạn có đồng ý phê duyệt ảnh biên lai chuyển khoản và xác nhận hóa đơn đã thanh toán không?');
    if (!xacNhan) return;

    try {
        await window.GoiAPI.post('/hoa-don/xac-nhan-thanh-toan', {
            idHoaDon,
            hinhThucThanhToan: 'chuyen_khoan',
            chapNhan: true
        });
        window.hienThongBao('Đã đối soát và xác nhận hóa đơn thành công!', 'thanh_cong');
        taiDanhSachHoaDon();
    } catch (loi) {
        window.hienThongBao('Lỗi đối soát: ' + loi.message, 'loi');
    }
}

async function xoaHoaDon(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này khỏi hệ thống?')) return;
    try {
        await window.GoiAPI.delete(`/hoa-don/${id}`);
        window.hienThongBao('Đã xóa hóa đơn thành công!', 'thanh_cong');
        taiDanhSachHoaDon();
    } catch (loi) {
        window.hienThongBao('Lỗi xóa hóa đơn: ' + loi.message, 'loi');
    }
}

window.moModalLapHoaDon = moModalLapHoaDon;
window.dongModalLapBill = dongModalLapBill;
window.xuLyLapBill = xuLyLapBill;
window.moModalVietQR = moModalVietQR;
window.dongModalVietQR = dongModalVietQR;
window.thucHienChiaBillCampuchia = thucHienChiaBillCampuchia;
window.xacNhanDuyetBill = xacNhanDuyetBill;
window.xoaHoaDon = xoaHoaDon;
window.tinhTienThoiGianThuc = tinhTienThoiGianThuc;

document.addEventListener('DOMContentLoaded', taiDanhSachHoaDon);
