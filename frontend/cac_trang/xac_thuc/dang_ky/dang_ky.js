function thayDoiVaiTro(vaiTro) {
    const vungKYC = document.getElementById('vung-kyc-chu-tro');
    if (vungKYC) {
        vungKYC.style.display = vaiTro === 'chu_doanh_nghiep' ? 'block' : 'none';
    }
}

window.thayDoiVaiTro = thayDoiVaiTro;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-dang-ky');
    const nutSubmit = document.getElementById('nut-dang-ky');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const vaiTro = document.querySelector('input[name="vaiTro"]:checked').value;
        const hoTen = document.getElementById('hoTen').value.trim();
        const email = document.getElementById('email').value.trim();
        const soDienThoai = document.getElementById('soDienThoai').value.trim();
        const matKhau = document.getElementById('matKhau').value;

        const cccdSo = document.getElementById('cccdSo') ? document.getElementById('cccdSo').value.trim() : '';

        nutSubmit.disabled = true;
        nutSubmit.textContent = 'ĐANG XỬ LÝ...';

        try {
            const res = await window.GoiAPI.post('/xac-thuc/dang-ky', {
                hoTen,
                email,
                soDienThoai,
                matKhau,
                vaiTro,
                cccdSo,
                anhCccdTruoc: '/tai_nguyen_dung_chung/hinh_anh/cccd_truoc_mau.jpg',
                anhCccdSau: '/tai_nguyen_dung_chung/hinh_anh/cccd_sau_mau.jpg'
            });

            window.hienThongBao(res.thong_diep || 'Đăng ký tài khoản thành công! Đang chuyển hướng...', 'thanh_cong');

            setTimeout(() => {
                window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html';
            }, 1500);
        } catch (loi) {
            console.error('Đăng ký thất bại:', loi);
            if (loi.status === 409) {
                window.hienThongBao(loi.message || 'Email hoặc số điện thoại này đã được đăng ký tài khoản!', 'canh_bao');
            } else if (loi.status === 400) {
                window.hienThongBao(loi.message || 'Thông tin nhập vào chưa hợp lệ!', 'canh_bao');
            } else {
                window.hienThongBao(loi.message || 'Lỗi hệ thống máy chủ khi đăng ký. Vui lòng thử lại!', 'loi');
            }
            nutSubmit.disabled = false;
            nutSubmit.textContent = 'ĐĂNG KÝ NGAY';
        }
    });
});
