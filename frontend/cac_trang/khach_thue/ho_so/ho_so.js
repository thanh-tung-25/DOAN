async function taiHoSo() {
    try {
        const res = await window.GoiAPI.get('/xac-thuc/thong-tin-ca-nhan');
        const user = res.du_lieu;
        if (!user) return;

        document.getElementById('hs-ho-ten').value = user.ho_ten || '';
        document.getElementById('hs-sdt').value = user.so_dien_thoai || '';
        document.getElementById('hs-email').value = user.email || '';
        document.getElementById('hs-ten-hien-thi').textContent = user.ho_ten || '';
        document.getElementById('hs-email-hien-thi').textContent = user.email || '';
    } catch (e) {
        console.error(e);
    }
}

async function capNhatThongTin(e) {
    e.preventDefault();
    const hoTen = document.getElementById('hs-ho-ten').value.trim();
    const soDienThoai = document.getElementById('hs-sdt').value.trim();

    try {
        await window.GoiAPI.put('/xac-thuc/cap-nhat-ho-so', { hoTen, soDienThoai });
        window.hienThongBao('Cập nhật thông tin cá nhân thành công!', 'thanh_cong');

        const u = window.LuuTru.layNguoiDung();
        if (u) {
            u.ho_ten = hoTen;
            u.so_dien_thoai = soDienThoai;
            window.LuuTru.luuNguoiDung(u);
        }
        taiHoSo();
    } catch (loi) {
        window.hienThongBao('Lỗi cập nhật: ' + loi.message, 'loi');
    }
}

window.capNhatThongTin = capNhatThongTin;

document.addEventListener('DOMContentLoaded', taiHoSo);
