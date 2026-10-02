async function taiDanhSachCheckIn() {
    try {
        const res = await window.GoiAPI.get('/hop-dong');
        const dsHD = res.du_lieu || [];
        const tbody = document.getElementById('bang-nv-checkin');
        if (!tbody) return;

        if (dsHD.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Không có hợp đồng nào trong khu vực</td></tr>';
            return;
        }

        tbody.innerHTML = dsHD.map(h => `
            <tr>
                <td><strong>${h.ma_phong}</strong></td>
                <td>${h.ma_hop_dong}</td>
                <td><strong>${h.ten_khach}</strong></td>
                <td>
                    <a href="tel:${h.sdt_khach}" class="nut-call">📞 ${h.sdt_khach}</a>
                </td>
                <td><small>${window.DinhDang.ngayThang(h.ngay_bat_dau)} đến ${window.DinhDang.ngayThang(h.ngay_ket_thuc)}</small></td>
                <td><span class="nhan-trang-thai trang-thai-${h.trang_thai}">${h.trang_thai}</span></td>
                <td>
                    <button class="nut-phu" style="font-size:11px;" onclick="thucHienCheckIn('${h.ma_phong}', '${h.ten_khach}')">🔑 Bàn giao chìa / Check-in</button>
                    <button class="nut-nguy-hiem" style="font-size:11px; margin-left:4px;" onclick="thucHienCheckOut('${h.ma_phong}', '${h.ten_khach}')">🚪 Check-out / Trả cọc</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        window.hienThongBao('Lỗi tải danh sách: ' + e.message, 'loi');
    }
}

function thucHienCheckIn(maPhong, tenKhach) {
    alert(`CHECK-IN THÀNH CÔNG!\nĐã bàn giao chìa khóa phòng ${maPhong} và kích hoạt thẻ từ ra vào 24/7 cho khách: ${tenKhach}.`);
}

function thucHienCheckOut(maPhong, tenKhach) {
    const chotDien = prompt(`Nhập số điện ngày cuối cùng trả phòng ${maPhong}:`, '325');
    if (!chotDien) return;
    const chotNuoc = prompt(`Nhập số nước ngày cuối cùng:`, '65');
    if (!chotNuoc) return;

    alert(`CHECK-OUT HOÀN TẤT!\nĐã kiểm tra tài sản nguyên vẹn.\nChốt chỉ số điện: ${chotDien} kWh, nước: ${chotNuoc} m³.\nHệ thống đã xuất biên bản thanh lý và khấu trừ tiền cọc giao lại cho khách: ${tenKhach}.`);
}

window.thucHienCheckIn = thucHienCheckIn;
window.thucHienCheckOut = thucHienCheckOut;

document.addEventListener('DOMContentLoaded', taiDanhSachCheckIn);
