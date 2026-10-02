const express = require('express');
const router = express.Router();

const tuyenXacThuc = require('./tuyen_xac_thuc');
const tuyenQuanTri = require('./tuyen_quan_tri');
const tuyenChuDoanhNghiep = require('./tuyen_chu_doanh_nghiep');
const tuyenPhongTro = require('./tuyen_phong_tro');
const tuyenBaiDang = require('./tuyen_bai_dang');
const tuyenHopDong = require('./tuyen_hop_dong');
const tuyenHoaDon = require('./tuyen_hoa_don');
const tuyenSuCo = require('./tuyen_su_co');
const tuyenTroLyAo = require('./tuyen_tro_ly_ao');
const tuyenTaiLen = require('./tuyen_tai_len');
const tuyenTinNhan = require('./tuyen_tin_nhan');

router.use('/xac-thuc', tuyenXacThuc);
router.use('/quan-tri', tuyenQuanTri);
router.use('/chu-doanh-nghiep', tuyenChuDoanhNghiep);
router.use('/phong-tro', tuyenPhongTro);
router.use('/bai-dang', tuyenBaiDang);
router.use('/hop-dong', tuyenHopDong);
router.use('/hoa-don', tuyenHoaDon);
router.use('/su-co', tuyenSuCo);
router.use('/tro-ly-ao', tuyenTroLyAo);
router.use('/tai-len', tuyenTaiLen);
router.use('/tin-nhan', tuyenTinNhan);

module.exports = router;
