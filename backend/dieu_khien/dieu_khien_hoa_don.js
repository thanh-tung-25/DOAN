const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');
const { taoMaVietQRDong } = require('../cau_hinh/vietqr');
const { ghiNhatKy } = require('../trung_gian/nhat_ky_thao_tac');

async function layDanhSachHoaDon(req, res) {
    try {
        let sql = `
            SELECT hd.*, p.ma_phong, kt.ten_khu_tro,
                   u_chu.stk_ngan_hang, u_chu.ten_ngan_hang, u_chu.ten_chu_tai_khoan,
                   u_khach.ho_ten AS ten_khach, u_khach.so_dien_thoai AS sdt_khach
            FROM hoa_don hd
            JOIN phong_tro p ON hd.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            JOIN hop_dong hopd ON hd.id_hop_dong = hopd.id
            JOIN nguoi_dung u_chu ON hopd.id_chu = u_chu.id
            JOIN nguoi_dung u_khach ON hopd.id_khach = u_khach.id
            WHERE 1=1
        `;
        const params = [];

        if (req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            sql += ` AND hopd.id_chu = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'khach_thue') {
            sql += ` AND hopd.id_khach = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'nhan_vien' && req.danhSachKhuTroDuocGiao) {
            sql += ` AND p.id_khu_tro IN (${req.danhSachKhuTroDuocGiao.map(() => '?').join(',')})`;
            params.push(...req.danhSachKhuTroDuocGiao);
        }

        sql += ` ORDER BY hd.nam DESC, hd.thang DESC, hd.id DESC`;
        const [danhSach] = await ketNoi.query(sql, params);

        // Sinh link VietQR dong va lay danh sach chia bill
        for (const item of danhSach) {
            item.linkVietQR = taoMaVietQRDong({
                nganHang: item.ten_ngan_hang || 'Vietcombank',
                stk: item.stk_ngan_hang || '0123456789',
                chuTaiKhoan: item.ten_chu_tai_khoan || 'CHU TRO',
                soTien: Number(item.tong_tien),
                noiDung: `TIEN PHONG ${item.ma_phong} THANG ${item.thang}/${item.nam}`
            });

            const [chiaBill] = await ketNoi.query('SELECT * FROM chi_tiet_chia_bill WHERE id_hoa_don = ?', [item.id]);
            item.danhSachChiaBill = chiaBill;
        }

        return phanHoiThanhCong(res, 'Lấy danh sách hóa đơn thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách hóa đơn', loi.message, 500);
    }
}

async function lapHoaDonMoi(req, res) {
    try {
        const { idHopDong, thang, nam, chiSoDienCu, chiSoDienMoi, chiSoNuocCu, chiSoNuocMoi } = req.body;

        const [hd] = await ketNoi.query(`
            SELECT hd.*, p.gia_thue, p.don_gia_dien, p.don_gia_nuoc, p.phi_dich_vu, p.id AS id_phong_thuc_te
            FROM hop_dong hd
            JOIN phong_tro p ON hd.id_phong = p.id
            WHERE hd.id = ?
        `, [idHopDong]);

        if (hd.length === 0) return phanHoiThatBai(res, 'Không tìm thấy hợp đồng hợp lệ');
        const hopDong = hd[0];

        const tieuThuDien = Math.max(0, Number(chiSoDienMoi) - Number(chiSoDienCu));
        const tieuThuNuoc = Math.max(0, Number(chiSoNuocMoi) - Number(chiSoNuocCu));

        const tienDien = tieuThuDien * Number(hopDong.don_gia_dien);
        const tienNuoc = tieuThuNuoc * Number(hopDong.don_gia_nuoc);
        const tienPhong = Number(hopDong.gia_thue);
        const phiDichVu = Number(hopDong.phi_dich_vu);
        const tongTien = tienPhong + tienDien + tienNuoc + phiDichVu;

        // Kiem tra bat thuong dien nuoc x3 trung binh 3 thang gan nhat
        const [lichSu3Thang] = await ketNoi.query(`
            SELECT AVG(chi_so_dien_moi - chi_so_dien_cu) AS tb_dien,
                   AVG(chi_so_nuoc_moi - chi_so_nuoc_cu) AS tb_nuoc
            FROM (
                SELECT chi_so_dien_moi, chi_so_dien_cu, chi_so_nuoc_moi, chi_so_nuoc_cu
                FROM hoa_don
                WHERE id_phong = ?
                ORDER BY id DESC LIMIT 3
            ) AS sub
        `, [hopDong.id_phong]);

        let canhBaoBatThuong = 0;
        if (lichSu3Thang.length > 0 && lichSu3Thang[0].tb_dien) {
            const tbDien = Number(lichSu3Thang[0].tb_dien);
            const tbNuoc = Number(lichSu3Thang[0].tb_nuoc);
            if ((tbDien > 0 && tieuThuDien >= tbDien * 3) || (tbNuoc > 0 && tieuThuNuoc >= tbNuoc * 3)) {
                canhBaoBatThuong = 1;
            }
        }

        const [kq] = await ketNoi.query(
            `INSERT INTO hoa_don (id_hop_dong, id_phong, thang, nam, chi_so_dien_cu, chi_so_dien_moi, don_gia_dien, chi_so_nuoc_cu, chi_so_nuoc_moi, don_gia_nuoc, tien_phong, tien_dien, tien_nuoc, phi_dich_vu, tong_tien, canh_bao_bat_thuong, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'chua_thanh_toan')`,
            [
                idHopDong, hopDong.id_phong, thang, nam,
                chiSoDienCu, chiSoDienMoi, hopDong.don_gia_dien,
                chiSoNuocCu, chiSoNuocMoi, hopDong.don_gia_nuoc,
                tienPhong, tienDien, tienNuoc, phiDichVu, tongTien, canhBaoBatThuong
            ]
        );

        return phanHoiThanhCong(res, 'Lập hóa đơn thành công', {
            id: kq.insertId,
            tongTien,
            canhBaoBatThuong: !!canhBaoBatThuong
        });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lập hóa đơn', loi.message, 500);
    }
}

async function chiaBillCampuchia(req, res) {
    try {
        const { idHoaDon, danhSachNguoiChia } = req.body;
        // danhSachNguoiChia: array of names or auto split
        const [hd] = await ketNoi.query(`
            SELECT hd.*, p.ma_phong, u_chu.stk_ngan_hang, u_chu.ten_ngan_hang, u_chu.ten_chu_tai_khoan
            FROM hoa_don hd
            JOIN phong_tro p ON hd.id_phong = p.id
            JOIN hop_dong hopd ON hd.id_hop_dong = hopd.id
            JOIN nguoi_dung u_chu ON hopd.id_chu = u_chu.id
            WHERE hd.id = ?
        `, [idHoaDon]);

        if (hd.length === 0) return phanHoiThatBai(res, 'Không tìm thấy hóa đơn');
        const hoaDon = hd[0];

        const soNguoi = danhSachNguoiChia.length;
        if (soNguoi === 0) return phanHoiThatBai(res, 'Cần ít nhất 1 người để chia bill');

        const tienMoiNguoi = Math.round(Number(hoaDon.tong_tien) / soNguoi);

        // Xoa chia bill cu neu co
        await ketNoi.query('DELETE FROM chi_tiet_chia_bill WHERE id_hoa_don = ?', [idHoaDon]);

        const ketQuaChia = [];
        for (const nguoi of danhSachNguoiChia) {
            const ten = typeof nguoi === 'string' ? nguoi : nguoi.hoTen;
            const vietqr = taoMaVietQRDong({
                nganHang: hoaDon.ten_ngan_hang || 'Vietcombank',
                stk: hoaDon.stk_ngan_hang || '0123456789',
                chuTaiKhoan: hoaDon.ten_chu_tai_khoan || 'CHU TRO',
                soTien: tienMoiNguoi,
                noiDung: `${ten.toUpperCase()} DONG TIEN P${hoaDon.ma_phong} T${hoaDon.thang}`
            });

            const [ins] = await ketNoi.query(
                'INSERT INTO chi_tiet_chia_bill (id_hoa_don, ho_ten, so_tien, ma_vietqr, trang_thai) VALUES (?, ?, ?, ?, "chua_thanh_toan")',
                [idHoaDon, ten, tienMoiNguoi, vietqr]
            );

            ketQuaChia.push({
                id: ins.insertId,
                hoTen: ten,
                soTien: tienMoiNguoi,
                maVietQR: vietqr
            });
        }

        return phanHoiThanhCong(res, `Chia bill Campuchia thành công cho ${soNguoi} người!`, ketQuaChia);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi chia bill', loi.message, 500);
    }
}

async function taiBienLai(req, res) {
    try {
        const { idHoaDon, duongDanAnh } = req.body;
        await ketNoi.query(
            'UPDATE hoa_don SET anh_bien_lai = ?, trang_thai = "cho_xac_nhan" WHERE id = ?',
            [duongDanAnh, idHoaDon]
        );
        return phanHoiThanhCong(res, 'Tải biên lai thanh toán thành công. Vui lòng chờ chủ trọ duyệt!');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi gửi biên lai', loi.message, 500);
    }
}

async function xacNhanThanhToan(req, res) {
    try {
        const { idHoaDon, hinhThucThanhToan, chapNhan } = req.body;
        // hinhThucThanhToan: 'chuyen_khoan' hoac 'tien_mat'

        if (!chapNhan) {
            await ketNoi.query('UPDATE hoa_don SET trang_thai = "chua_thanh_toan" WHERE id = ?', [idHoaDon]);
            return phanHoiThanhCong(res, 'Đã từ chối biên lai thanh toán');
        }

        await ketNoi.query(
            `UPDATE hoa_don SET 
            trang_thai = 'da_thanh_toan',
            hinh_thuc_thanh_toan = ?,
            id_nhan_vien_thu = ?,
            ngay_thanh_toan = NOW()
            WHERE id = ?`,
            [hinhThucThanhToan || 'chuyen_khoan', req.nguoiDung.id, idHoaDon]
        );

        // Cap nhat cac chia bill lien quan
        await ketNoi.query('UPDATE chi_tiet_chia_bill SET trang_thai = "da_thanh_toan", ngay_thanh_toan = NOW() WHERE id_hoa_don = ?', [idHoaDon]);

        await ghiNhatKy(
            req.nguoiDung.id,
            `Xác nhận thanh toán hóa đơn #${idHoaDon} (${hinhThucThanhToan})`,
            'hoa_don',
            idHoaDon
        );

        return phanHoiThanhCong(res, 'Xác nhận thu tiền hóa đơn thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xác nhận thanh toán', loi.message, 500);
    }
}

async function xoaHoaDon(req, res) {
    try {
        const { id } = req.params;
        await ketNoi.query('DELETE FROM hoa_don WHERE id = ?', [id]);
        return phanHoiThanhCong(res, 'Xóa hóa đơn thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xóa hóa đơn', loi.message, 500);
    }
}

module.exports = {
    layDanhSachHoaDon,
    lapHoaDonMoi,
    chiaBillCampuchia,
    taiBienLai,
    xacNhanThanhToan,
    xoaHoaDon
};
