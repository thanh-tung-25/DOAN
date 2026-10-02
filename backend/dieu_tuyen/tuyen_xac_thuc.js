const express = require('express');
const router = express.Router();
const { dangNhap, dangKy, layThongTinHienTai, capNhatHoSo } = require('../dieu_khien/dieu_khien_xac_thuc');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');

router.post('/dang-nhap', dangNhap);
router.post('/dang-ky', dangKy);
router.get('/thong-tin-ca-nhan', xacThucNguoiDung, layThongTinHienTai);
router.put('/cap-nhat-ho-so', xacThucNguoiDung, capNhatHoSo);

module.exports = router;
