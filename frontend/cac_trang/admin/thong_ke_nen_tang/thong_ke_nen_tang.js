async function taiThongKeNenTang() {
    try {
        const res = await window.GoiAPI.get('/quan-tri/thong-ke');
        const data = res.du_lieu;

        document.getElementById('kpi-tong-user').textContent = data.tongNguoiDung || 0;
        document.getElementById('kpi-tong-chu').textContent = data.tongChuTro || 0;
        document.getElementById('kpi-tong-hop-dong').textContent = data.tongHopDongThanhCong || 0;
        document.getElementById('kpi-doanh-thu-hoa-hong').textContent = window.DinhDang.tienVND(data.tongDoanhThuHoaHong || 0);
    } catch (loi) {
        window.hienThongBao('Không thể tải dữ liệu thống kê nền tảng: ' + loi.message, 'loi');
    }
}

document.addEventListener('DOMContentLoaded', taiThongKeNenTang);
