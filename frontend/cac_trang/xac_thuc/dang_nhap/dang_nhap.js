function dienThongTin(email, matKhau) {
    document.getElementById('email').value = email;
    document.getElementById('matKhau').value = matKhau;
}

window.dienThongTin = dienThongTin;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-dang-nhap');
    const nutSubmit = document.getElementById('nut-dang-nhap');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const matKhau = document.getElementById('matKhau').value;

        if (!email || !matKhau) {
            window.hienThongBao('Vui lòng nhập đầy đủ email và mật khẩu!', 'loi');
            return;
        }

        nutSubmit.disabled = true;
        nutSubmit.textContent = 'ĐANG XỬ LÝ...';

        try {
            const res = await window.GoiAPI.post('/xac-thuc/dang-nhap', { email, matKhau });

            window.hienThongBao('Đăng nhập thành công! Đang chuyển hướng...', 'thanh_cong');

            window.LuuTru.luuToken(res.du_lieu.token);
            window.LuuTru.luuNguoiDung(res.du_lieu.nguoi_dung);

            const vaiTro = res.du_lieu.nguoi_dung.vai_tro;

            setTimeout(() => {
                if (vaiTro === 'admin') {
                    window.location.href = '/cac_trang/admin/thong_ke_nen_tang/thong_ke_nen_tang.html';
                } else if (vaiTro === 'chu_doanh_nghiep') {
                    window.location.href = '/cac_trang/chu_doanh_nghiep/thong_ke/thong_ke.html';
                } else if (vaiTro === 'nhan_vien') {
                    window.location.href = '/cac_trang/nhan_vien/tong_quan_van_hanh/tong_quan_van_hanh.html';
                } else {
                    window.location.href = '/cac_trang/khach_thue/tim_phong/tim_phong.html';
                }
            }, 800);
        } catch (loi) {
            console.error('Đăng nhập thất bại:', loi);
            if (loi.status === 401) {
                window.hienThongBao('Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!', 'loi');
            } else if (loi.status === 403) {
                window.hienThongBao('Tài khoản của bạn đang bị khóa hoặc cấm khỏi hệ thống!', 'canh_bao');
            } else if (loi.status === 400) {
                window.hienThongBao(loi.message || 'Dữ liệu nhập vào chưa hợp lệ!', 'canh_bao');
            } else {
                window.hienThongBao(loi.message || 'Lỗi hệ thống máy chủ. Vui lòng thử lại sau!', 'loi');
            }
            nutSubmit.disabled = false;
            nutSubmit.textContent = 'ĐĂNG NHẬP';
        }
    });
});
