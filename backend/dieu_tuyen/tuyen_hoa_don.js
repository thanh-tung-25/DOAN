const express = require('express');
const router = express.Router();
const {
    layDanhSachHoaDon,
    lapHoaDonMoi,
    chiaBillCampuchia,
    taiBienLai,
    xacNhanThanhToan,
    xoaHoaDon
} = require('../dieu_khien/dieu_khien_hoa_don');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');
const { cachLyDuLieuKhuVuc } = require('../trung_gian/cach_ly_du_lieu');

router.get('/', xacThucNguoiDung, cachLyDuLieuKhuVuc, layDanhSachHoaDon);
router.post('/lap-hoa-don', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'nhan_vien'), lapHoaDonMoi);
router.post('/chia-bill-campuchia', xacThucNguoiDung, chiaBillCampuchia);
router.post('/tai-bien-lai', xacThucNguoiDung, phanQuyenVaiTro('khach_thue'), taiBienLai);
router.post('/xac-nhan-thanh-toan', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'nhan_vien'), xacNhanThanhToan);
router.delete('/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'admin'), xoaHoaDon);

module.exports = router;
