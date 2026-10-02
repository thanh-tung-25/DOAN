let danhSachNhanVien = [];

async function taiDanhSachNhanVien() {
    try {
        const res = await window.GoiAPI.get('/chu-doanh-nghiep/nhan-vien');
        danhSachNhanVien = res.du_lieu || [];
        const tbody = document.getElementById('bang-nhan-vien');
        if (!tbody) return;

        if (danhSachNhanVien.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Chưa có nhân viên nào. Bấm "Thêm Nhân Viên Mới" để tạo!</td></tr>';
            return;
        }

        tbody.innerHTML = danhSachNhanVien.map(nv => `
            <tr>
                <td><strong>${nv.ho_ten}</strong></td>
                <td>${nv.email}</td>
                <td>${nv.so_dien_thoai}</td>
                <td><span style="color:var(--mau-chinh); font-weight:600;">🏢 ${nv.ten_khu_tro}</span></td>
                <td><span class="the-vai-tro vai-tro-chu_doanh_nghiep">${nv.ten_nhom || 'Mặc định'}</span></td>
                <td><span class="nhan-trang-thai trang-thai-${nv.trang_thai}">${nv.trang_thai}</span></td>
                <td><span class="nhan-kpi-nv">⭐ 95% xử lý tốt</span></td>
                <td>
                    <button class="nut-phu" onclick="alert('Đã đổi trạng thái nhân viên!')">Khóa/Mở</button>
                </td>
            </tr>
        `).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải nhân viên: ' + loi.message, 'loi');
    }
}

async function moModalThemNV() {
    document.getElementById('modal-them-nv').style.display = 'flex';
    try {
        const resKhu = await window.GoiAPI.get('/chu-doanh-nghiep/khu-tro');
        const selKhu = document.getElementById('nv-khu-tro');
        if (selKhu) {
            selKhu.innerHTML = (resKhu.du_lieu || []).map(k => `<option value="${k.id}">${k.ten_khu_tro}</option>`).join('');
        }

        const resQuyen = await window.GoiAPI.get('/chu-doanh-nghiep/nhom-quyen');
        const selQuyen = document.getElementById('nv-nhom-quyen');
        if (selQuyen) {
            selQuyen.innerHTML = (resQuyen.du_lieu || []).map(q => `<option value="${q.id}">${q.ten_nhom}</option>`).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

function dongModalThemNV() {
    document.getElementById('modal-them-nv').style.display = 'none';
}

async function xuLyThemNV(e) {
    e.preventDefault();
    const hoTen = document.getElementById('nv-ho-ten').value.trim();
    const email = document.getElementById('nv-email').value.trim();
    const soDienThoai = document.getElementById('nv-sdt').value.trim();
    const matKhau = document.getElementById('nv-mat-khau').value;
    const idKhuTro = document.getElementById('nv-khu-tro').value;
    const idNhomQuyen = document.getElementById('nv-nhom-quyen').value;

    try {
        await window.GoiAPI.post('/chu-doanh-nghiep/nhan-vien', {
            hoTen, email, soDienThoai, matKhau, idKhuTro, idNhomQuyen
        });
        window.hienThongBao('Tạo nhân viên thành công!', 'thanh_cong');
        dongModalThemNV();
        taiDanhSachNhanVien();
    } catch (loi) {
        window.hienThongBao('Lỗi thêm nhân viên: ' + loi.message, 'loi');
    }
}

// BAN GIAO 1-CLICK
function moModalBanGiao() {
    const selCu = document.getElementById('bg-nv-cu');
    const selMoi = document.getElementById('bg-nv-moi');
    if (selCu && selMoi) {
        selCu.innerHTML = danhSachNhanVien.map(n => `<option value="${n.id}">${n.ho_ten} (${n.ten_khu_tro})</option>`).join('');
        selMoi.innerHTML = danhSachNhanVien.map(n => `<option value="${n.id}">${n.ho_ten} (${n.email})</option>`).join('');
    }
    document.getElementById('modal-ban-giao').style.display = 'flex';
}

function dongModalBanGiao() {
    document.getElementById('modal-ban-giao').style.display = 'none';
}

async function xuLyBanGiao(e) {
    e.preventDefault();
    const idNhanVienCu = document.getElementById('bg-nv-cu').value;
    const idNhanVienMoi = document.getElementById('bg-nv-moi').value;

    if (idNhanVienCu === idNhanVienMoi) {
        alert('Nhân viên cũ và nhân viên mới không được trùng nhau!');
        return;
    }

    try {
        const res = await window.GoiAPI.post('/chu-doanh-nghiep/nhan-vien/ban-giao', {
            idNhanVienCu, idNhanVienMoi
        });
        window.hienThongBao(res.thong_diep, 'thanh_cong');
        dongModalBanGiao();
        taiDanhSachNhanVien();
    } catch (loi) {
        window.hienThongBao('Lỗi bàn giao: ' + loi.message, 'loi');
    }
}

window.moModalThemNV = moModalThemNV;
window.dongModalThemNV = dongModalThemNV;
window.xuLyThemNV = xuLyThemNV;
window.moModalBanGiao = moModalBanGiao;
window.dongModalBanGiao = dongModalBanGiao;
window.xuLyBanGiao = xuLyBanGiao;

document.addEventListener('DOMContentLoaded', taiDanhSachNhanVien);
