async function taiDanhSachKiemDuyet() {
    try {
        const res = await window.GoiAPI.get('/quan-tri/kiem-duyet-bai-dang');
        const danhSach = res.du_lieu || [];
        const tbody = document.getElementById('bang-kiem-duyet');
        if (!tbody) return;

        if (danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Chưa có bài đăng nào cần duyệt</td></tr>';
            return;
        }

        tbody.innerHTML = danhSach.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td>
                    <strong>${b.tieu_de}</strong><br>
                    <small>Phòng: ${b.ma_phong} | Diện tích: ${b.dien_tich} m²</small>
                </td>
                <td>
                    ${b.ten_chu_tro}<br>
                    <small>${b.sdt_chu_tro}</small>
                </td>
                <td><strong>${window.DinhDang.tienVND(b.gia_thue)}</strong></td>
                <td>
                    ${b.so_luot_report > 0 ? `<span class="so-report-do">⚠️ ${b.so_luot_report} báo cáo</span>` : '0'}
                </td>
                <td><span class="nhan-trang-thai trang-thai-${b.trang_thai}">${b.trang_thai}</span></td>
                <td><small style="color:#b91c1c;">${b.ly_do_vi_pham || 'Không'}</small></td>
                <td>
                    <div class="nhom-nut-kiem-duyet">
                        ${b.trang_thai === 'bi_go' ? `
                            <button class="nut-thanh-cong" onclick="xuLyBaiDang(${b.id}, 'khoi_phuc')">Khôi phục</button>
                        ` : `
                            <button class="nut-nguy-hiem" onclick="xuLyBaiDang(${b.id}, 'go_bai')">Gỡ bài vi phạm</button>
                        `}
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải danh sách kiểm duyệt: ' + loi.message, 'loi');
    }
}

async function xuLyBaiDang(idBaiDang, hanhDong) {
    let lyDo = '';
    if (hanhDong === 'go_bai') {
        lyDo = prompt('Nhập lý do gỡ bài (Hệ thống sẽ gửi cảnh báo đến chủ trọ):');
        if (!lyDo) return;
    } else {
        const xacNhan = confirm('Bạn có chắc chắn muốn khôi phục bài đăng này lên sàn sau khi chủ trọ giải trình hợp lệ?');
        if (!xacNhan) return;
    }

    try {
        await window.GoiAPI.post('/quan-tri/kiem-duyet-bai-dang/xu-ly', { idBaiDang, hanhDong, lyDo });
        window.hienThongBao(`Đã ${hanhDong === 'go_bai' ? 'gỡ bài vi phạm' : 'khôi phục bài đăng'} thành công!`, 'thanh_cong');
        taiDanhSachKiemDuyet();
    } catch (loi) {
        window.hienThongBao('Lỗi xử lý: ' + loi.message, 'loi');
    }
}

window.xuLyBaiDang = xuLyBaiDang;
document.addEventListener('DOMContentLoaded', taiDanhSachKiemDuyet);
