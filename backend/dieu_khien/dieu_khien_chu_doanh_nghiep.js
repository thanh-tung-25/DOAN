const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');
const { bamMatKhau } = require('../tien_ich/ma_hoa');
const { ghiNhatKy } = require('../trung_gian/nhat_ky_thao_tac');

// 1. QUAN LY KHU TRO
async function layDanhSachKhuTro(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const [danhSach] = await ketNoi.query(
            'SELECT * FROM khu_tro WHERE id_chu_doanh_nghiep = ? ORDER BY id DESC',
            [idChu]
        );
        return phanHoiThanhCong(res, 'Lấy danh sách khu trọ thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách khu trọ', loi.message, 500);
    }
}

async function themKhuTro(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { tenKhuTro, tinhThanh, quanHuyen, phuongXa, diaChiChiTiet, toaDoLat, toaDoLng } = req.body;

        const [ketQua] = await ketNoi.query(
            `INSERT INTO khu_tro (id_chu_doanh_nghiep, ten_khu_tro, tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet, toa_do_lat, toa_do_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [idChu, tenKhuTro, tinhThanh, quanHuyen, phuongXa, diaChiChiTiet, toaDoLat || 10.776889, toaDoLng || 106.700806]
        );

        return phanHoiThanhCong(res, 'Thêm khu trọ thành công', { id: ketQua.insertId });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi thêm khu trọ', loi.message, 500);
    }
}

// 2. QUAN LY NHAN VIEN & PHAN CONG KHU VUC
async function layDanhSachNhanVien(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const [danhSach] = await ketNoi.query(`
            SELECT u.id, u.ho_ten, u.email, u.so_dien_thoai, u.trang_thai,
                   nv.id_khu_tro, kt.ten_khu_tro, nv.id_nhom_quyen, nq.ten_nhom
            FROM nguoi_dung u
            JOIN nhan_vien_khu_vuc nv ON u.id = nv.id_nhan_vien
            JOIN khu_tro kt ON nv.id_khu_tro = kt.id
            LEFT JOIN nhom_quyen nq ON nv.id_nhom_quyen = nq.id
            WHERE kt.id_chu_doanh_nghiep = ?
            ORDER BY u.id DESC
        `, [idChu]);

        return phanHoiThanhCong(res, 'Lấy danh sách nhân viên thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách nhân viên', loi.message, 500);
    }
}

async function themNhanVien(req, res) {
    try {
        const { hoTen, email, soDienThoai, matKhau, idKhuTro, idNhomQuyen } = req.body;
        if (!hoTen || !email || !soDienThoai || !matKhau || !idKhuTro) {
            return phanHoiThatBai(res, 'Vui lòng điền đủ thông tin nhân viên và phân công khu trọ');
        }

        const matKhauBAM = bamMatKhau(matKhau);

        // Tao tai khoan nguoi dung
        const [userResult] = await ketNoi.query(
            `INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai, mat_khau, vai_tro, trang_thai)
            VALUES (?, ?, ?, ?, 'nhan_vien', 'hoat_dong')`,
            [hoTen.trim(), email.trim(), soDienThoai.trim(), matKhauBAM]
        );

        const idNhanVien = userResult.insertId;

        // Phan cong khu vuc va nhom quyen
        await ketNoi.query(
            `INSERT INTO nhan_vien_khu_vuc (id_nhan_vien, id_khu_tro, id_nhom_quyen) VALUES (?, ?, ?)`,
            [idNhanVien, idKhuTro, idNhomQuyen || null]
        );

        await ghiNhatKy(req.nguoiDung.id, 'Tạo mới nhân viên quản lý', 'nhan_vien_khu_vuc', idNhanVien);

        return phanHoiThanhCong(res, 'Thêm nhân viên và phân công khu vực thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi thêm nhân viên', loi.message, 500);
    }
}

// 3. BAN GIAO CONG VIEC 1-CLICK
async function banGiaoCongViec(req, res) {
    try {
        const { idNhanVienCu, idNhanVienMoi } = req.body;
        if (!idNhanVienCu || !idNhanVienMoi) {
            return phanHoiThatBai(res, 'Vui lòng chọn nhân viên cũ và nhân viên mới để bàn giao');
        }

        // Chuyen toan bo su co (ticket) dang xu ly sang nhan vien moi
        const [resSuCo] = await ketNoi.query(
            'UPDATE su_co SET id_nhan_vien_xu_ly = ? WHERE id_nhan_vien_xu_ly = ? AND trang_thai != "da_hoan_thanh"',
            [idNhanVienMoi, idNhanVienCu]
        );

        // Chuyen khu vuc quan ly
        await ketNoi.query(
            'UPDATE nhan_vien_khu_vuc SET id_nhan_vien = ? WHERE id_nhan_vien = ?',
            [idNhanVienMoi, idNhanVienCu]
        );

        await ghiNhatKy(
            req.nguoiDung.id,
            `Bàn giao công việc 1-Click từ NV #${idNhanVienCu} sang NV #${idNhanVienMoi}`,
            'su_co',
            null,
            { idNhanVienCu },
            { idNhanVienMoi, soSuCoChuyenGiao: resSuCo.affectedRows }
        );

        return phanHoiThanhCong(res, `Đã bàn giao công việc thành công! (${resSuCo.affectedRows} sự cố chuyển giao)`);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi bàn giao công việc', loi.message, 500);
    }
}

// 4. PHAN QUYEN RBAC & AUDIT LOGS
async function layMaTranPhanQuyen(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const [nhomQuyen] = await ketNoi.query('SELECT * FROM nhom_quyen WHERE id_chu_doanh_nghiep = ?', [idChu]);

        for (const n of nhomQuyen) {
            const [chiTiet] = await ketNoi.query('SELECT * FROM phan_quyen_chi_tiet WHERE id_nhom_quyen = ?', [n.id]);
            n.chiTiet = chiTiet;
        }

        return phanHoiThanhCong(res, 'Lấy ma trận quyền thành công', nhomQuyen);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy ma trận phân quyền', loi.message, 500);
    }
}

async function luuNhomQuyen(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { tenNhom, moTa, danhSachQuyen } = req.body;

        const [kq] = await ketNoi.query(
            'INSERT INTO nhom_quyen (id_chu_doanh_nghiep, ten_nhom, mo_ta) VALUES (?, ?, ?)',
            [idChu, tenNhom, moTa]
        );
        const idNhomMoi = kq.insertId;

        if (Array.isArray(danhSachQuyen)) {
            for (const q of danhSachQuyen) {
                await ketNoi.query(
                    `INSERT INTO phan_quyen_chi_tiet (id_nhom_quyen, ma_chuc_nang, quyen_xem, quyen_them, quyen_sua, quyen_xoa)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [idNhomMoi, q.maChucNang, q.xem ? 1 : 0, q.them ? 1 : 0, q.sua ? 1 : 0, q.xoa ? 1 : 0]
                );
            }
        }

        return phanHoiThanhCong(res, 'Tạo nhóm quyền RBAC thành công', { id: idNhomMoi });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lưu nhóm quyền', loi.message, 500);
    }
}

async function layNhatKyAuditLog(req, res) {
    try {
        const [logs] = await ketNoi.query(`
            SELECT nk.*, u.ho_ten, u.vai_tro 
            FROM nhat_ky_he_thong nk
            LEFT JOIN nguoi_dung u ON nk.id_nguoi_dung = u.id
            ORDER BY nk.id DESC LIMIT 100
        `);
        return phanHoiThanhCong(res, 'Lấy lịch sử Audit Logs thành công', logs);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy nhật ký hệ thống', loi.message, 500);
    }
}

// 5. THONG KE CHU TRO (KPI DOANH THU & DIEN NUOC)
async function layThongKeChuTro(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { nam } = req.query;
        const namChon = nam || new Date().getFullYear();

        // Tong so phong, phong trong, da thue
        const [phong] = await ketNoi.query(`
            SELECT 
                COUNT(*) AS tong_phong,
                SUM(CASE WHEN p.trang_thai = 'con_trong' THEN 1 ELSE 0 END) AS phong_trong,
                SUM(CASE WHEN p.trang_thai = 'da_thue' THEN 1 ELSE 0 END) AS da_thue
            FROM phong_tro p
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            WHERE kt.id_chu_doanh_nghiep = ?
        `, [idChu]);

        // Doanh thu va san luong dien nuoc theo thang
        const [doanhThu] = await ketNoi.query(`
            SELECT hd.thang, 
                   SUM(hd.tong_tien) AS tong_doanh_thu,
                   SUM(CASE WHEN hd.trang_thai = 'da_thanh_toan' THEN hd.tong_tien ELSE 0 END) AS da_thu,
                   SUM(CASE WHEN hd.trang_thai != 'da_thanh_toan' THEN hd.tong_tien ELSE 0 END) AS con_no,
                   SUM(hd.chi_so_dien_moi - hd.chi_so_dien_cu) AS kwh_dien,
                   SUM(hd.chi_so_nuoc_moi - hd.chi_so_nuoc_cu) AS m3_nuoc
            FROM hoa_don hd
            JOIN phong_tro p ON hd.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            WHERE kt.id_chu_doanh_nghiep = ? AND hd.nam = ?
            GROUP BY hd.thang
            ORDER BY hd.thang ASC
        `, [idChu, namChon]);

        return phanHoiThanhCong(res, 'Lấy thống kê chủ trọ thành công', {
            tongQuanPhong: phong[0],
            duLieuTheoThang: doanhThu
        });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy thống kê', loi.message, 500);
    }
}

module.exports = {
    layDanhSachKhuTro,
    themKhuTro,
    layDanhSachNhanVien,
    themNhanVien,
    banGiaoCongViec,
    layMaTranPhanQuyen,
    luuNhomQuyen,
    layNhatKyAuditLog,
    layThongKeChuTro
};
