const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function cachLyDuLieuKhuVuc(req, res, next) {
    try {
        if (!req.nguoiDung) {
            return next();
        }

        // Neu la Chu tro hoac Admin thi khong can cach ly khu vuc
        if (req.nguoiDung.vai_tro === 'admin' || req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            req.danhSachKhuTroDuocGiao = null; // Toan quyen
            return next();
        }

        // Neu la Nhan vien thi trích xuat danh sach khu tro duoc phan cong
        if (req.nguoiDung.vai_tro === 'nhan_vien') {
            const [khuTro] = await ketNoi.query(
                'SELECT id_khu_tro, id_nhom_quyen FROM nhan_vien_khu_vuc WHERE id_nhan_vien = ?',
                [req.nguoiDung.id]
            );

            req.danhSachKhuTroDuocGiao = khuTro.map(k => k.id_khu_tro);
            req.idNhomQuyen = khuTro.length > 0 ? khuTro[0].id_nhom_quyen : null;
            return next();
        }

        next();
    } catch (loi) {
        console.error('Loi middleware cach ly du lieu:', loi);
        return phanHoiThatBai(res, 'Lỗi kiểm tra quyền hạn khu vực', 'LOI_CACH_LY_DU_LIEU', 500);
    }
}

module.exports = {
    cachLyDuLieuKhuVuc
};
