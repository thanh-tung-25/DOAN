const jwt = require('jsonwebtoken');
const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { biMatJWT, thoiHanJWT } = require('../cau_hinh/jwt');
const { bamMatKhau, soSanhMatKhau } = require('../tien_ich/ma_hoa');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function dangNhap(req, res) {
    try {
        const { email, matKhau } = req.body;
        if (!email || !matKhau || typeof email !== 'string' || typeof matKhau !== 'string') {
            return phanHoiThatBai(res, 'Vui lòng nhập đầy đủ Email và Mật khẩu', null, 400);
        }

        const emailChuan = email.trim().toLowerCase();
        const [nguoiDung] = await ketNoi.query(
            'SELECT * FROM nguoi_dung WHERE email = ?',
            [emailChuan]
        );

        if (!nguoiDung || nguoiDung.length === 0) {
            return phanHoiThatBai(res, 'Email hoặc mật khẩu không chính xác', 'XAC_THUC_THAT_BAI', 401);
        }

        const user = nguoiDung[0];

        if (!soSanhMatKhau(matKhau, user.mat_khau)) {
            return phanHoiThatBai(res, 'Email hoặc mật khẩu không chính xác', 'XAC_THUC_THAT_BAI', 401);
        }

        if (user.trang_thai === 'bi_cam' || user.trang_thai === 'bi_khoa') {
            return phanHoiThatBai(res, 'Tài khoản của bạn đã bị khóa hoặc cấm khỏi hệ thống', 'TAI_KHOAN_BI_KHOA', 403);
        }

        // Tạo JWT Token
        const token = jwt.sign(
            { id: user.id, vai_tro: user.vai_tro },
            biMatJWT,
            { expiresIn: thoiHanJWT }
        );

        delete user.mat_khau;

        return phanHoiThanhCong(res, 'Đăng nhập thành công', {
            nguoi_dung: user,
            token
        }, 200);
    } catch (loi) {
        console.error('Lỗi dangNhap:', loi);
        return phanHoiThatBai(res, 'Lỗi hệ thống trong quá trình đăng nhập', loi.message, 500);
    }
}

async function dangKy(req, res) {
    try {
        const { hoTen, email, soDienThoai, matKhau, vaiTro, cccdSo, anhCccdTruoc, anhCccdBau, anhGpkd } = req.body;

        if (!hoTen || !email || !soDienThoai || !matKhau) {
            return phanHoiThatBai(res, 'Vui lòng nhập đầy đủ Họ tên, Email, Số điện thoại và Mật khẩu', null, 400);
        }

        const hoTenTrim = hoTen.trim();
        const emailTrim = email.trim().toLowerCase();
        const cleanPhone = soDienThoai.trim().replace(/\D/g, '');

        // Validation định dạng
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrim)) {
            return phanHoiThatBai(res, 'Địa chỉ email không đúng định dạng hợp lệ', 'EMAIL_KHONG_HOP_LE', 400);
        }

        if (cleanPhone.length < 9 || cleanPhone.length > 11) {
            return phanHoiThatBai(res, 'Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 chữ số)', 'SDT_KHONG_HOP_LE', 400);
        }

        if (matKhau.length < 6) {
            return phanHoiThatBai(res, 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự', 'MAT_KHAU_YEU', 400);
        }

        const vaiTroChuan = ['chu_doanh_nghiep', 'khach_thue'].includes(vaiTro) ? vaiTro : 'khach_thue';
        const trangThai = vaiTroChuan === 'chu_doanh_nghiep' ? 'cho_duyet_kyc' : 'hoat_dong';

        // Kiểm tra trùng lặp Email hoặc Số điện thoại
        const [kiemTra] = await ketNoi.query(
            'SELECT id, email, so_dien_thoai FROM nguoi_dung WHERE email = ? OR so_dien_thoai = ?',
            [emailTrim, cleanPhone]
        );

        if (kiemTra.length > 0) {
            const daCoEmail = kiemTra.some(u => u.email.toLowerCase() === emailTrim);
            return phanHoiThatBai(
                res,
                daCoEmail ? 'Địa chỉ Email này đã tồn tại trên hệ thống' : 'Số điện thoại này đã được đăng ký tài khoản',
                'TRUNG_LAP_DU_LIEU',
                409
            );
        }

        const matKhauBAM = bamMatKhau(matKhau);

        const [ketQua] = await ketNoi.query(
            `INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, mat_khau, vai_tro, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [hoTenTrim, emailTrim, cleanPhone, matKhauBAM, vaiTroChuan, trangThai]
        );

        const idNguoiDung = ketQua.insertId;

        // Nếu là chủ trọ thì tạo hồ sơ KYC chờ duyệt
        if (vaiTroChuan === 'chu_doanh_nghiep' && cccdSo) {
            await ketNoi.query(
                `INSERT INTO ho_so_kyc (id_nguoi_dung, cccd_so, anh_cccd_truoc, anh_cccd_sau, anh_giay_phep_kd, trang_thai)
                VALUES (?, ?, ?, ?, ?, 'cho_duyet')`,
                [idNguoiDung, cccdSo.trim(), anhCccdTruoc || '', anhCccdBau || '', anhGpkd || '']
            );
        }

        const thongBao = vaiTroChuan === 'chu_doanh_nghiep'
            ? 'Đăng ký tài khoản Chủ trọ thành công! Hồ sơ KYC đang chờ Ban Quản Trị phê duyệt.'
            : 'Đăng ký tài khoản Khách thuê thành công! Bạn có thể đăng nhập ngay.';

        return phanHoiThanhCong(res, thongBao, { id: idNguoiDung }, 201);
    } catch (loi) {
        console.error('Lỗi dangKy:', loi);
        return phanHoiThatBai(res, 'Lỗi hệ thống khi đăng ký tài khoản', loi.message, 500);
    }
}

async function layThongTinHienTai(req, res) {
    try {
        const [nguoiDung] = await ketNoi.query(
            'SELECT id, ho_ten, email, so_dien_thoai, vai_tro, anh_dai_dien, trang_thai, stk_ngan_hang, ten_ngan_hang, ten_chu_tai_khoan, tao_luc FROM nguoi_dung WHERE id = ?',
            [req.nguoiDung.id]
        );

        if (!nguoiDung || nguoiDung.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy người dùng');
        }

        return phanHoiThanhCong(res, 'Lấy thông tin thành công', nguoiDung[0]);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy thông tin cá nhân', loi.message, 500);
    }
}

async function capNhatHoSo(req, res) {
    try {
        const { hoTen, soDienThoai, anhDaiDien, stkNganHang, tenNganHang, tenChuTaiKhoan } = req.body;
        await ketNoi.query(
            `UPDATE nguoi_dung SET 
            ho_ten = COALESCE(?, ho_ten),
            so_dien_thoai = COALESCE(?, so_dien_thoai),
            anh_dai_dien = COALESCE(?, anh_dai_dien),
            stk_ngan_hang = COALESCE(?, stk_ngan_hang),
            ten_ngan_hang = COALESCE(?, ten_ngan_hang),
            ten_chu_tai_khoan = COALESCE(?, ten_chu_tai_khoan)
            WHERE id = ?`,
            [hoTen, soDienThoai, anhDaiDien, stkNganHang, tenNganHang, tenChuTaiKhoan, req.nguoiDung.id]
        );

        return phanHoiThanhCong(res, 'Cập nhật thông tin cá nhân thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi cập nhật thông tin', loi.message, 500);
    }
}

module.exports = {
    dangNhap,
    dangKy,
    layThongTinHienTai,
    capNhatHoSo
};
