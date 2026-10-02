const { phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

function phanQuyenVaiTro(...danhSachVaiTro) {
    return (req, res, next) => {
        if (!req.nguoiDung) {
            return phanHoiThatBai(res, 'Chưa xác thực người dùng', 'CHUA_XAC_THUC', 401);
        }

        if (!danhSachVaiTro.includes(req.nguoiDung.vai_tro)) {
            return phanHoiThatBai(
                res,
                `Bạn không có quyền truy cập chức năng này (Yêu cầu vai trò: ${danhSachVaiTro.join(', ')})`,
                'KHONG_DU_QUYEN',
                403
            );
        }

        next();
    };
}

module.exports = {
    phanQuyenVaiTro
};
