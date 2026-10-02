const express = require('express');
const router = express.Router();
const {
    layDanhSachHoiThoai,
    layLichSuTinNhan,
    guiTinNhan,
    dangKyOGhepVaMoChat
} = require('../dieu_khien/dieu_khien_tin_nhan');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');

// Mọi tác vụ chat yêu cầu người dùng phải đăng nhập
router.use(xacThucNguoiDung);

router.get('/danh-sach-hoi-thoai', layDanhSachHoiThoai);
router.get('/lich-su/:idDoiPhuong', layLichSuTinNhan);
router.post('/gui', guiTinNhan);
router.post('/dang-ky-o-ghep', dangKyOGhepVaMoChat);

module.exports = router;
