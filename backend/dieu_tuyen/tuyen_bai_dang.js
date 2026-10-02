const express = require('express');
const router = express.Router();
const {
    layDanhSachBaiDang,
    layChiTietBaiDang,
    taoBaiDangTuPhong,
    xoaBaiDang,
    baoCaoBaiDang
} = require('../dieu_khien/dieu_khien_bai_dang');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');

router.get('/', layDanhSachBaiDang);
router.get('/:id', layChiTietBaiDang);
router.post('/tao-tu-phong', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), taoBaiDangTuPhong);
router.delete('/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'admin'), xoaBaiDang);
router.post('/bao-cao', baoCaoBaiDang);

module.exports = router;
