const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');
const { ghiNhatKy } = require('../trung_gian/nhat_ky_thao_tac');

async function layDanhSachSuCo(req, res) {
    try {
        let sql = `
            SELECT sc.*, p.ma_phong, kt.ten_khu_tro,
                   u_khach.ho_ten AS ten_khach, u_khach.so_dien_thoai AS sdt_khach,
                   u_nv.ho_ten AS ten_nhan_vien
            FROM su_co sc
            JOIN phong_tro p ON sc.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            JOIN nguoi_dung u_khach ON sc.id_khach = u_khach.id
            LEFT JOIN nguoi_dung u_nv ON sc.id_nhan_vien_xu_ly = u_nv.id
            WHERE 1=1
        `;
        const params = [];

        if (req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            sql += ` AND kt.id_chu_doanh_nghiep = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'khach_thue') {
            sql += ` AND sc.id_khach = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'nhan_vien' && req.danhSachKhuTroDuocGiao) {
            sql += ` AND p.id_khu_tro IN (${req.danhSachKhuTroDuocGiao.map(() => '?').join(',')})`;
            params.push(...req.danhSachKhuTroDuocGiao);
        }

        sql += ` ORDER BY sc.id DESC`;
        const [danhSach] = await ketNoi.query(sql, params);

        return phanHoiThanhCong(res, 'Lấy danh sách sự cố thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách sự cố', loi.message, 500);
    }
}

async function taoSuCo(req, res) {
    try {
        const idKhach = req.nguoiDung.id;
        const { idPhong, tieuDe, moTa, anhDinhKem } = req.body;

        const [kq] = await ketNoi.query(
            `INSERT INTO su_co (id_phong, id_khach, tieu_de, mo_ta, anh_dinh_kem, trang_thai)
            VALUES (?, ?, ?, ?, ?, 'moi_tiep_nhan')`,
            [idPhong || 1, idKhach, tieuDe, moTa, anhDinhKem || '']
        );

        return phanHoiThanhCong(res, 'Gửi yêu cầu báo hỏng thành công', { id: kq.insertId });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi tạo yêu cầu báo hỏng', loi.message, 500);
    }
}

async function capNhatTienDoSuCo(req, res) {
    try {
        const { id } = req.params;
        const { trangThai, chiPhiVatTu, nguoiChiuPhi, idNhanVienXuLy } = req.body;

        await ketNoi.query(
            `UPDATE su_co SET 
            trang_thai = COALESCE(?, trang_thai),
            chi_phi_vat_tu = COALESCE(?, chi_phi_vat_tu),
            nguoi_chiu_phi = COALESCE(?, nguoi_chiu_phi),
            id_nhan_vien_xu_ly = COALESCE(?, id_nhan_vien_xu_ly)
            WHERE id = ?`,
            [trangThai, chiPhiVatTu, nguoiChiuPhi, idNhanVienXuLy || req.nguoiDung.id, id]
        );

        await ghiNhatKy(
            req.nguoiDung.id,
            `Cập nhật tiến độ sự cố #${id} sang trạng thái: ${trangThai}`,
            'su_co',
            id
        );

        return phanHoiThanhCong(res, 'Cập nhật tiến độ xử lý sự cố thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi cập nhật sự cố', loi.message, 500);
    }
}

module.exports = {
    layDanhSachSuCo,
    taoSuCo,
    capNhatTienDoSuCo
};
