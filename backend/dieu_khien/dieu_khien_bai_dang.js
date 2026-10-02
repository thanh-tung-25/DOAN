const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function layDanhSachBaiDang(req, res) {
    try {
        const { tuKhoa, giaMin, giaMax, tinhThanh, quanHuyen, phuongXa, choOGhep, idChu } = req.query;
        let sql = `
            SELECT b.*, p.ma_phong, p.trang_thai AS trang_thai_phong,
                   kt.ten_khu_tro, kt.tinh_thanh, kt.quan_huyen, kt.phuong_xa, kt.dia_chi_chi_tiet,
                   kt.toa_do_lat, kt.toa_do_lng,
                   u.ho_ten AS ten_chu, u.so_dien_thoai AS sdt_chu, u.email AS email_chu, u.anh_dai_dien AS avatar_chu
            FROM bai_dang b
            JOIN phong_tro p ON b.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            JOIN nguoi_dung u ON b.id_chu = u.id
            WHERE b.trang_thai = 'da_duyet'
        `;
        const params = [];

        if (idChu) {
            sql += ` AND b.id_chu = ?`;
            params.push(Number(idChu));
        }
        if (tuKhoa) {
            sql += ` AND (b.tieu_de LIKE ? OR kt.dia_chi_chi_tiet LIKE ? OR kt.phuong_xa LIKE ? OR kt.tinh_thanh LIKE ? OR kt.quan_huyen LIKE ? OR u.ho_ten LIKE ? OR u.so_dien_thoai LIKE ?)`;
            params.push(`%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`);
        }
        if (giaMin) {
            sql += ` AND b.gia_thue >= ?`;
            params.push(Number(giaMin));
        }
        if (giaMax) {
            sql += ` AND b.gia_thue <= ?`;
            params.push(Number(giaMax));
        }
        if (tinhThanh) {
            sql += ` AND kt.tinh_thanh = ?`;
            params.push(tinhThanh);
        }
        if (phuongXa) {
            sql += ` AND kt.phuong_xa = ?`;
            params.push(phuongXa);
        }
        if (quanHuyen) {
            sql += ` AND kt.quan_huyen = ?`;
            params.push(quanHuyen);
        }
        if (choOGhep !== undefined && choOGhep !== '') {
            sql += ` AND b.cho_o_ghep = ?`;
            params.push(Number(choOGhep));
        }

        sql += ` ORDER BY b.id DESC`;
        const [danhSach] = await ketNoi.query(sql, params);

        return phanHoiThanhCong(res, 'Lấy danh sách bài đăng thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy bài đăng', loi.message, 500);
    }
}

async function layChiTietBaiDang(req, res) {
    try {
        const { id } = req.params;
        const [baiDang] = await ketNoi.query(`
            SELECT b.*, p.ma_phong, p.tang, p.don_gia_dien, p.don_gia_nuoc, p.phi_dich_vu,
                   p.trang_thai AS trang_thai_phong,
                   kt.ten_khu_tro, kt.tinh_thanh, kt.quan_huyen, kt.phuong_xa, kt.dia_chi_chi_tiet,
                   kt.toa_do_lat, kt.toa_do_lng,
                   u.ho_ten AS ten_chu, u.so_dien_thoai AS sdt_chu, u.email AS email_chu, u.anh_dai_dien AS avatar_chu
            FROM bai_dang b
            JOIN phong_tro p ON b.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            JOIN nguoi_dung u ON b.id_chu = u.id
            WHERE b.id = ?
        `, [id]);

        if (baiDang.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy bài đăng');
        }

        return phanHoiThanhCong(res, 'Lấy chi tiết bài đăng thành công', baiDang[0]);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy chi tiết bài đăng', loi.message, 500);
    }
}

const { chuyenDiaChiThanhToaDo } = require('../tien_ich/dinh_vi_dia_ly');

async function taoBaiDangTuPhong(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { idPhong, tieuDe, moTa, tienIch, danhSachAnh, choOGhep, giaThue, dienTich } = req.body;

        if (!idPhong || !tieuDe || tieuDe.trim().length === 0) {
            return phanHoiThatBai(res, 'Vui lòng chọn phòng và nhập tiêu đề bài đăng', null, 400);
        }

        // Lấy thông tin phòng và địa chỉ khu trọ để Geocoding tọa độ thật
        const [phong] = await ketNoi.query(`
            SELECT p.id, p.gia_thue, p.dien_tich,
                   kt.id AS id_khu_tro, kt.dia_chi_chi_tiet, kt.phuong_xa, kt.quan_huyen, kt.tinh_thanh,
                   kt.toa_do_lat, kt.toa_do_lng
            FROM phong_tro p
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            WHERE p.id = ?
        `, [idPhong]);

        if (phong.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy thông tin phòng trọ này', null, 404);
        }

        const infoPhong = phong[0];
        const giaThucTe = (giaThue && Number(giaThue) > 0) ? Number(giaThue) : infoPhong.gia_thue;
        const dienTichThucTe = (dienTich && Number(dienTich) > 0) ? Number(dienTich) : infoPhong.dien_tich;

        // Geocoding địa chỉ thật sang Latitude, Longitude qua OpenStreetMap API
        const diaChiDayDu = [infoPhong.dia_chi_chi_tiet, infoPhong.phuong_xa, infoPhong.quan_huyen, infoPhong.tinh_thanh].filter(Boolean).join(', ');
        if (diaChiDayDu) {
            try {
                const toaDo = await chuyenDiaChiThanhToaDo(diaChiDayDu);
                if (toaDo && toaDo.lat && toaDo.lng) {
                    await ketNoi.query(
                        'UPDATE khu_tro SET toa_do_lat = ?, toa_do_lng = ? WHERE id = ?',
                        [toaDo.lat, toaDo.lng, infoPhong.id_khu_tro]
                    );
                }
            } catch (errGeo) {
                console.warn('[Geocoding] Bỏ qua lỗi tọa độ:', errGeo.message);
            }
        }

        const [kq] = await ketNoi.query(
            `INSERT INTO bai_dang (id_phong, id_chu, tieu_de, mo_ta, gia_thue, dien_tich, tien_ich, danh_sach_anh, cho_o_ghep, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'da_duyet')`,
            [
                idPhong,
                idChu,
                tieuDe.trim(),
                moTa ? moTa.trim() : '',
                giaThucTe,
                dienTichThucTe,
                tienIch || '',
                typeof danhSachAnh === 'object' ? JSON.stringify(danhSachAnh) : (danhSachAnh || '[]'),
                choOGhep !== undefined ? Number(choOGhep) : 1
            ]
        );

        return phanHoiThanhCong(res, 'Tạo bài đăng cho thuê thành công với tọa độ thực tế', { id: kq.insertId }, 201);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi tạo bài đăng', loi.message, 500);
    }
}

async function xoaBaiDang(req, res) {
    try {
        const { id } = req.params;
        const idNguoiDung = req.nguoiDung.id;
        const vaiTro = req.nguoiDung.vai_tro;

        // 1. Kiểm tra sự tồn tại của bài đăng
        const [baiDang] = await ketNoi.query('SELECT id, id_chu, tieu_de FROM bai_dang WHERE id = ?', [id]);
        if (!baiDang || baiDang.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy bài đăng để xóa', null, 404);
        }

        const bai = baiDang[0];

        // 2. Kiểm tra quyền xóa: Chỉ chủ trọ người đăng bài đó hoặc Quản trị viên mới được xóa
        if (vaiTro !== 'admin' && Number(bai.id_chu) !== Number(idNguoiDung)) {
            return phanHoiThatBai(
                res,
                'Bạn không có quyền xóa bài đăng này! Chỉ chủ trọ người đăng bài mới có quyền xóa.',
                null,
                403
            );
        }

        // 3. Thực hiện xóa bài đăng
        await ketNoi.query('DELETE FROM bai_dang WHERE id = ?', [id]);
        return phanHoiThanhCong(res, `Đã xóa bài đăng "${bai.tieu_de}" thành công`);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xóa bài đăng', loi.message, 500);
    }
}

async function baoCaoBaiDang(req, res) {
    try {
        const { idBaiDang, lyDo } = req.body;
        await ketNoi.query(
            'UPDATE bai_dang SET so_luot_report = so_luot_report + 1, ly_do_vi_pham = CONCAT(COALESCE(ly_do_vi_pham, ""), " | ", ?) WHERE id = ?',
            [lyDo || 'Người dùng báo cáo vi phạm', idBaiDang]
        );
        return phanHoiThanhCong(res, 'Báo cáo bài đăng thành công. Ban Quản Trị sẽ sớm kiểm duyệt!');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi báo cáo bài đăng', loi.message, 500);
    }
}

module.exports = {
    layDanhSachBaiDang,
    layChiTietBaiDang,
    taoBaiDangTuPhong,
    xoaBaiDang,
    baoCaoBaiDang
};
