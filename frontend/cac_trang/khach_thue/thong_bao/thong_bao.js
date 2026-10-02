async function taiSuCoKhach() {
    try {
        const res = await window.GoiAPI.get('/su-co');
        const danhSach = res.du_lieu || [];
        const tbody = document.getElementById('bang-su-co-khach');
        if (!tbody) return;

        if (danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Bạn chưa gửi báo hỏng nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSach.map(s => `
            <tr>
                <td>#TK-${s.id}</td>
                <td><strong>${s.tieu_de}</strong></td>
                <td><small>${s.mo_ta}</small></td>
                <td><span class="nhan-trang-thai trang-thai-${s.trang_thai}">${s.trang_thai}</span></td>
                <td>${s.chi_phi_vat_tu > 0 ? window.DinhDang.tienVND(s.chi_phi_vat_tu) : 'Chủ trọ hỗ trợ'}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function moModalBaoHong() {
    document.getElementById('modal-bao-hong').style.display = 'flex';
    try {
        const res = await window.GoiAPI.get('/hop-dong');
        const dsHD = res.du_lieu || [];
        const sel = document.getElementById('bh-phong');
        if (sel) {
            if (dsHD.length > 0) {
                sel.innerHTML = dsHD.map(h => `<option value="${h.id_phong}">${h.ma_phong} - ${h.ten_khu_tro}</option>`).join('');
            } else {
                sel.innerHTML = '<option value="1">Phòng P.101</option>';
            }
        }
    } catch (e) {
        console.error('Lỗi tải phòng thuê:', e);
    }
}

function dongModalBaoHong() {
    document.getElementById('modal-bao-hong').style.display = 'none';
}

async function xuLyGuiBaoHong(e) {
    e.preventDefault();
    const idPhong = document.getElementById('bh-phong').value;
    const tieuDe = document.getElementById('bh-tieu-de').value.trim();
    const moTa = document.getElementById('bh-mo-ta').value.trim();

    try {
        await window.GoiAPI.post('/su-co', { tieuDe, moTa, idPhong: Number(idPhong) });
        window.hienThongBao('Đã gửi phiếu báo hỏng thành công vào MySQL! Nhân viên sẽ đến hỗ trợ sớm nhất.', 'thanh_cong');
        dongModalBaoHong();
        taiSuCoKhach();
    } catch (loi) {
        window.hienThongBao('Lỗi gửi báo hỏng: ' + loi.message, 'loi');
    }
}

window.moModalBaoHong = moModalBaoHong;
window.dongModalBaoHong = dongModalBaoHong;
window.xuLyGuiBaoHong = xuLyGuiBaoHong;

document.addEventListener('DOMContentLoaded', taiSuCoKhach);
