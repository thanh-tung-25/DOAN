const express = require('express');
const router = express.Router();
const {
    layDanhSachKhuTro,
    themKhuTro,
    layDanhSachNhanVien,
    themNhanVien,
    banGiaoCongViec,
    layMaTranPhanQuyen,
    luuNhomQuyen,
    layNhatKyAuditLog,
    layThongKeChuTro
} = require('../dieu_khien/dieu_khien_chu_doanh_nghiep');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');

router.use(xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'));

router.get('/khu-tro', layDanhSachKhuTro);
router.post('/khu-tro', themKhuTro);

router.get('/nhan-vien', layDanhSachNhanVien);
router.post('/nhan-vien', themNhanVien);
router.post('/nhan-vien/ban-giao', banGiaoCongViec);

router.get('/nhom-quyen', layMaTranPhanQuyen);
router.post('/nhom-quyen', luuNhomQuyen);

router.get('/nhat-ky-audit-log', layNhatKyAuditLog);
router.get('/thong-ke', layThongKeChuTro);

module.exports = router;
