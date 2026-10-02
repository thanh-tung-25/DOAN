const jwt = require('jsonwebtoken');
const { biMatJWT } = require('../cau_hinh/jwt');
const { phanHoiThatBai } = require('../tien_ich/phan_hoi_api');
const ketNoi = require('../cau_hinh/co_so_du_lieu');

async function xacThucNguoiDung(req, res, next) {
    try {
        const tieuDeAuth = req.headers['authorization'];
        if (!tieuDeAuth || !tieuDeAuth.startsWith('Bearer ')) {
            return phanHoiThatBai(res, 'Vui lòng đăng nhập để tiếp tục', 'CHUA_DANG_NHAP', 401);
        }

        const token = tieuDeAuth.split(' ')[1];
        const duLieuGiaiMa = jwt.verify(token, biMatJWT);

        const [nguoiDung] = await ketNoi.query(
            'SELECT id, ho_ten, email, so_dien_thoai, vai_tro, trang_thai FROM nguoi_dung WHERE id = ?',
            [duLieuGiaiMa.id]
        );

        if (!nguoiDung || nguoiDung.length === 0) {
            return phanHoiThatBai(res, 'Tài khoản không tồn tại', 'TAI_KHOAN_KHONG_TON_TAI', 401);
        }

        const thongTin = nguoiDung[0];
        if (thongTin.trang_thai === 'bi_cam' || thongTin.trang_thai === 'bi_khoa') {
            return phanHoiThatBai(res, 'Tài khoản của bạn đã bị khóa hoặc cấm khỏi hệ thống', 'TAI_KHOAN_BI_KHOA', 403);
        }

        req.nguoiDung = thongTin;
        next();
    } catch (loi) {
        return phanHoiThatBai(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 'TOKEN_KHONG_HOP_LE', 401);
    }
}

module.exports = {
    xacThucNguoiDung
};
