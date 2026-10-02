const express = require('express');
const router = express.Router();
const {
    layDanhSachHopDong,
    taoHopDong,
    kyHopDongCanvas,
    giaHanHopDong1Click
} = require('../dieu_khien/dieu_khien_hop_dong');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');
const { cachLyDuLieuKhuVuc } = require('../trung_gian/cach_ly_du_lieu');

router.get('/', xacThucNguoiDung, cachLyDuLieuKhuVuc, layDanhSachHopDong);
router.post('/', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), taoHopDong);
router.post('/ky-canvas', xacThucNguoiDung, kyHopDongCanvas);
router.post('/gia-han-1-click', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'khach_thue'), giaHanHopDong1Click);

module.exports = router;
