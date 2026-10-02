const express = require('express');
const router = express.Router();
const {
    layDanhSachPhong,
    themPhong,
    capNhatPhong,
    xoaPhong,
    layThietBiPhong,
    themThietBi,
    ghiBaoTriThietBi,
    layTatCaThietBi,
    xoaThietBi
} = require('../dieu_khien/dieu_khien_phong_tro');
const { xacThucNguoiDung } = require('../trung_gian/xac_thuc');
const { phanQuyenVaiTro } = require('../trung_gian/phan_quyen');
const { cachLyDuLieuKhuVuc } = require('../trung_gian/cach_ly_du_lieu');

router.get('/', xacThucNguoiDung, cachLyDuLieuKhuVuc, layDanhSachPhong);
router.post('/', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), themPhong);
router.put('/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep', 'nhan_vien'), capNhatPhong);
router.delete('/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), xoaPhong);

// Sổ tài sản thiết bị toàn doanh nghiệp (phải đặt trước /:idPhong/thiet-bi)
router.get('/tat-ca-thiet-bi', xacThucNguoiDung, layTatCaThietBi);
router.get('/:idPhong/thiet-bi', xacThucNguoiDung, layThietBiPhong);
router.post('/thiet-bi', xacThucNguoiDung, themThietBi);
router.post('/thiet-bi/bao-tri', xacThucNguoiDung, ghiBaoTriThietBi);
router.delete('/thiet-bi/:id', xacThucNguoiDung, phanQuyenVaiTro('chu_doanh_nghiep'), xoaThietBi);

module.exports = router;
