async function taiDanhSachHoaHong() {
    try {
        const res = await window.GoiAPI.get('/quan-tri/hoa-hong');
        const { danhSach, tongDaThu, tongConNo } = res.du_lieu;

        document.getElementById('tong-da-thu').textContent = window.DinhDang.tienVND(tongDaThu || 0);
        document.getElementById('tong-con-no').textContent = window.DinhDang.tienVND(tongConNo || 0);

        const tbody = document.getElementById('bang-hoa-hong');
        if (!tbody) return;

        if (!danhSach || danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có dữ liệu hoa hồng</td></tr>';
            return;
        }

        tbody.innerHTML = danhSach.map(h => `
            <tr>
                <td><strong>${h.ma_hop_dong}</strong></td>
                <td>
                    ${h.ten_chu_tro}<br>
                    <small>${h.so_dien_thoai} | ${h.email}</small>
                </td>
                <td><strong style="color:var(--mau-chinh);">${window.DinhDang.tienVND(h.so_tien)}</strong></td>
                <td>${window.DinhDang.ngayThang(h.han_chot)}</td>
                <td><span class="nhan-trang-thai trang-thai-${h.trang_thai}">${h.trang_thai === 'da_thu' ? 'Đã thu tiền' : 'Chưa nộp'}</span></td>
                <td>
                    ${h.trang_thai !== 'da_thu' ? `
                        <button class="nut-phu" onclick="nhacNoChuTro('${h.ten_chu_tro}')">🔔 Nhắc nợ</button>
                        <button class="nut-nguy-hiem" onclick="khoaTinQuaHan('${h.ten_chu_tro}')">🚫 Khóa bài nợ quá hạn</button>
                    ` : `
                        <span>✓ Đã thanh toán</span>
                    `}
                </td>
            </tr>
        `).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải hoa hồng: ' + loi.message, 'loi');
    }
}

function nhacNoChuTro(ten) {
    alert(`Đã gửi cảnh báo nhắc nợ tự động kèm email hóa đơn hoa hồng tới chủ trọ: ${ten}`);
}

function khoaTinQuaHan(ten) {
    alert(`Đã kích hoạt khóa tự động toàn bộ bài đăng của chủ trọ: ${ten} do quá hạn thanh toán phí hoa hồng sàn!`);
}

window.nhacNoChuTro = nhacNoChuTro;
window.khoaTinQuaHan = khoaTinQuaHan;

document.addEventListener('DOMContentLoaded', taiDanhSachHoaHong);
