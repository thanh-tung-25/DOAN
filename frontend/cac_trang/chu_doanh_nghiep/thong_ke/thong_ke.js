async function taiThongKeChuTro() {
    try {
        const res = await window.GoiAPI.get('/chu-doanh-nghiep/thong-ke');
        const { tongQuanPhong, duLieuTheoThang } = res.du_lieu;

        if (tongQuanPhong) {
            document.getElementById('kpi-tong-phong').textContent = tongQuanPhong.tong_phong || 0;
            document.getElementById('kpi-da-thue').textContent = tongQuanPhong.da_thue || 0;
            document.getElementById('kpi-con-trong').textContent = tongQuanPhong.phong_trong || 0;
        }

        let tongDoanhThuGanNhat = 0;
        if (duLieuTheoThang && duLieuTheoThang.length > 0) {
            tongDoanhThuGanNhat = duLieuTheoThang[duLieuTheoThang.length - 1].tong_doanh_thu;
        }
        document.getElementById('kpi-doanh-thu').textContent = window.DinhDang.tienVND(tongDoanhThuGanNhat || 0);

        const tbody = document.getElementById('bang-thong-ke-thang');
        if (!tbody) return;

        if (!duLieuTheoThang || duLieuTheoThang.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có dữ liệu tháng nào</td></tr>';
            return;
        }

        tbody.innerHTML = duLieuTheoThang.map(d => `
            <tr>
                <td><strong>Tháng ${d.thang}/2026</strong></td>
                <td><strong>${window.DinhDang.tienVND(d.tong_doanh_thu)}</strong></td>
                <td><span class="tien-xanh">${window.DinhDang.tienVND(d.da_thu)}</span></td>
                <td><span class="tien-do">${window.DinhDang.tienVND(d.con_no)}</span></td>
                <td>⚡ ${d.kwh_dien || 0} kWh</td>
                <td>💧 ${d.m3_nuoc || 0} m³</td>
            </tr>
        `).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải thống kê: ' + loi.message, 'loi');
    }
}

document.addEventListener('DOMContentLoaded', taiThongKeChuTro);
