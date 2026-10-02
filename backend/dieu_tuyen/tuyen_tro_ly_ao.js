const express = require('express');
const router = express.Router();
const {
    layDanhSachFAQ,
    luuFAQ,
    xoaFAQ,
    hoiDapChatbot
} = require('../dieu_khien/dieu_khien_tro_ly_ao');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');

router.get('/faq', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), layDanhSachFAQ);
router.post('/faq', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), luuFAQ);
router.delete('/faq/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), xoaFAQ);

router.post('/hoi-dap', hoiDapChatbot);

module.exports = router;
