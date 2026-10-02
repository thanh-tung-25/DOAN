const express = require('express');
const router = express.Router();
const {
    layDanhSachSuCo,
    taoSuCo,
    capNhatTienDoSuCo
} = require('../dieu_khien/dieu_khien_su_co');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { cachLyDuLieuKhuVuc } = require('../trung_gian/cach_ly_du_lieu');

router.get('/', xacThucNguoiDung, cachLyDuLieuKhuVuc, layDanhSachSuCo);
router.post('/', xacThucNguoiDung, taoSuCo);
router.put('/:id', xacThucNguoiDung, capNhatTienDoSuCo);

module.exports = router;
