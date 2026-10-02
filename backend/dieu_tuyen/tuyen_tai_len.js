const express = require('express');
const router = express.Router();
const taiLen = require('../trung_gian/tai_len_tep');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

// Upload 1 ảnh
router.post('/anh', (req, res) => {
    taiLen.single('anh')(req, res, (err) => {
        if (err) {
            return phanHoiThatBai(res, 'Lỗi tải ảnh lên', err.message, 400);
        }
        if (!req.file) {
            return phanHoiThatBai(res, 'Vui lòng chọn một file ảnh', null, 400);
        }
        const duongDan = `/luu_tru_tep/${req.file.filename}`;
        return phanHoiThanhCong(res, 'Tải ảnh lên thành công', {
            duong_dan: duongDan,
            ten_file: req.file.filename,
            ten_goc: req.file.originalname,
            kich_thuoc: req.file.size
        });
    });
});

// Upload nhiều ảnh cùng lúc
router.post('/nhieu-anh', (req, res) => {
    taiLen.array('cac_anh', 12)(req, res, (err) => {
        if (err) {
            return phanHoiThatBai(res, 'Lỗi tải các ảnh lên', err.message, 400);
        }
        if (!req.files || req.files.length === 0) {
            return phanHoiThatBai(res, 'Vui lòng chọn ít nhất một file ảnh', null, 400);
        }
        const danhSachDuongDan = req.files.map(f => `/luu_tru_tep/${f.filename}`);
        return phanHoiThanhCong(res, 'Tải danh sách ảnh thành công', {
            danh_sach: danhSachDuongDan,
            chi_tiet: req.files.map(f => ({
                duong_dan: `/luu_tru_tep/${f.filename}`,
                ten_file: f.filename,
                ten_goc: f.originalname,
                kich_thuoc: f.size
            }))
        });
    });
});

module.exports = router;
