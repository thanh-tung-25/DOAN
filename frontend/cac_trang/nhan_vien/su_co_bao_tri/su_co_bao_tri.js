let danhSachSuCoNV = [];

async function taiDanhSachSuCoNV() {
    try {
        const res = await window.GoiAPI.get('/su-co');
        danhSachSuCoNV = res.du_lieu || [];
        const tbody = document.getElementById('bang-su-co-nv');
        if (!tbody) return;

        if (danhSachSuCoNV.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Không có sự cố nào cần xử lý</td></tr>';
            return;
        }

        tbody.innerHTML = danhSachSuCoNV.map(s => `
            <tr>
                <td>#${s.id}</td>
                <td><strong>${s.ma_phong}</strong></td>
                <td>
                    ${s.ten_khach}<br>
                    <small>${s.sdt_khach}</small>
                </td>
                <td><strong>${s.tieu_de}</strong></td>
                <td><small>${s.mo_ta}</small></td>
                <td><span class="nhan-trang-thai trang-thai-${s.trang_thai}">${s.trang_thai}</span></td>
                <td><strong>${window.DinhDang.tienVND(s.chi_phi_vat_tu)}</strong></td>
                <td>
                    ${s.trang_thai === 'moi_tiep_nhan' ? `
                        <button class="nut-phu" onclick="chuyenTrangThaiSuCo(${s.id}, 'dang_sua_chua')">➔ Bắt đầu sửa</button>
                    ` : (s.trang_thai === 'dang_sua_chua' ? `
                        <button class="nut-thanh-cong" onclick="hoanThanhSuCo(${s.id})">✓ Đã sửa xong</button>
                    ` : '<span style="color:#10b981;">✓ Hoàn thành</span>')}
                </td>
            </tr>
        `).join('');
    } catch (e) {
        window.hienThongBao('Lỗi tải sự cố: ' + e.message, 'loi');
    }
}

async function chuyenTrangThaiSuCo(id, trangThaiMoi) {
    try {
        await window.GoiAPI.put(`/su-co/${id}`, { trangThai: trangThaiMoi });
        window.hienThongBao('Đã cập nhật trạng thái tiến độ xử lý!', 'thanh_cong');
        taiDanhSachSuCoNV();
    } catch (e) {
        window.hienThongBao('Lỗi cập nhật: ' + e.message, 'loi');
    }
}

async function hoanThanhSuCo(id) {
    const chiPhi = prompt('Nhập chi phí vật tư phát sinh (nếu có, đơn vị VND):', '0');
    if (chiPhi === null) return;

    try {
        await window.GoiAPI.put(`/su-co/${id}`, {
            trangThai: 'da_hoan_thanh',
            chiPhiVatTu: Number(chiPhi) || 0,
            nguoiChiuPhi: 'chu_tro'
        });
        window.hienThongBao('Đã hoàn thành sự cố và ghi nhận chi phí vật tư!', 'thanh_cong');
        taiDanhSachSuCoNV();
    } catch (e) {
        window.hienThongBao('Lỗi: ' + e.message, 'loi');
    }
}

window.chuyenTrangThaiSuCo = chuyenTrangThaiSuCo;
window.hoanThanhSuCo = hoanThanhSuCo;

document.addEventListener('DOMContentLoaded', taiDanhSachSuCoNV);
