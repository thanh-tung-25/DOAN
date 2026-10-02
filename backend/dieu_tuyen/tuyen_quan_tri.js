const express = require('express');
const router = express.Router();
const {
    layDanhSachNguoiDung,
    capNhatTrangThaiNguoiDung,
    layDanhSachKYC,
    pheDuyetKYC,
    layDanhSachKiemDuyetBaiDang,
    xuLyBaiDang,
    layThongKeHoaHong,
    layThongKeNenTang
} = require('../dieu_khien/dieu_khien_quan_tri');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');

router.use(xacThucNguoiDung, phanQuyenVaiTro('admin'));

router.get('/nguoi-dung', layDanhSachNguoiDung);
router.put('/nguoi-dung/trang-thai', capNhatTrangThaiNguoiDung);

router.get('/kyc', layDanhSachKYC);
router.post('/kyc/duyet', pheDuyetKYC);

router.get('/kiem-duyet-bai-dang', layDanhSachKiemDuyetBaiDang);
router.post('/kiem-duyet-bai-dang/xu-ly', xuLyBaiDang);

router.get('/hoa-hong', layThongKeHoaHong);
router.get('/thong-ke', layThongKeNenTang);

module.exports = router;
