const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function layDanhSachHopDong(req, res) {
    try {
        let sql = `
            SELECT hd.*, p.ma_phong, kt.ten_khu_tro, kt.dia_chi_chi_tiet,
                   u_chu.ho_ten AS ten_chu, u_chu.so_dien_thoai AS sdt_chu,
                   u_khach.ho_ten AS ten_khach, u_khach.so_dien_thoai AS sdt_khach, u_khach.email AS email_khach
            FROM hop_dong hd
            JOIN phong_tro p ON hd.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            JOIN nguoi_dung u_chu ON hd.id_chu = u_chu.id
            JOIN nguoi_dung u_khach ON hd.id_khach = u_khach.id
            WHERE 1=1
        `;
        const params = [];

        if (req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            sql += ` AND hd.id_chu = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'khach_thue') {
            sql += ` AND hd.id_khach = ?`;
            params.push(req.nguoiDung.id);
        } else if (req.nguoiDung.vai_tro === 'nhan_vien' && req.danhSachKhuTroDuocGiao) {
            sql += ` AND p.id_khu_tro IN (${req.danhSachKhuTroDuocGiao.map(() => '?').join(',')})`;
            params.push(...req.danhSachKhuTroDuocGiao);
        }

        sql += ` ORDER BY hd.id DESC`;
        const [danhSach] = await ketNoi.query(sql, params);

        // Lay thong tin nguoi o ghep cho tung hop dong
        for (const item of danhSach) {
            const [oGhep] = await ketNoi.query('SELECT * FROM nguoi_o_ghep WHERE id_hop_dong = ?', [item.id]);
            item.danhSachOGhep = oGhep;
        }

        return phanHoiThanhCong(res, 'Lấy danh sách hợp đồng thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy hợp đồng', loi.message, 500);
    }
}

async function taoHopDong(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { idPhong, idKhach, giaThue, tienCoc, ngayBatDau, ngayKetThuc, dieuKhoan, chuKyChu, danhSachOGhep } = req.body;

        const maHopDong = `HD-${Date.now().toString().slice(-6)}-P${idPhong}`;

        const [kq] = await ketNoi.query(
            `INSERT INTO hop_dong (id_phong, id_chu, id_khach, ma_hop_dong, gia_thue, tien_coc, ngay_bat_dau, ngay_ket_thuc, dieu_khoan, chu_ky_chu, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_ky')`,
            [idPhong, idChu, idKhach, maHopDong, giaThue, tienCoc || giaThue, ngayBatDau, ngayKetThuc, dieuKhoan, chuKyChu || null]
        );

        const idHopDong = kq.insertId;

        // Them nguoi o ghep neu co
        if (Array.isArray(danhSachOGhep) && danhSachOGhep.length > 0) {
            for (const og of danhSachOGhep) {
                if (og.hoTen) {
                    await ketNoi.query(
                        'INSERT INTO nguoi_o_ghep (id_hop_dong, ho_ten, so_dien_thoai, email, cccd) VALUES (?, ?, ?, ?, ?)',
                        [idHopDong, og.hoTen, og.soDienThoai || '', og.email || '', og.cccd || '']
                    );
                }
            }
        }

        return phanHoiThanhCong(res, 'Khởi tạo hợp đồng thành công', { id: idHopDong, maHopDong });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi tạo hợp đồng', loi.message, 500);
    }
}

async function kyHopDongCanvas(req, res) {
    try {
        const { idHopDong, chuKyCanvas, vaiTroKy } = req.body;
        // vaiTroKy: 'chu' hoac 'khach'

        const [hd] = await ketNoi.query('SELECT * FROM hop_dong WHERE id = ?', [idHopDong]);
        if (hd.length === 0) return phanHoiThatBai(res, 'Không tìm thấy hợp đồng');

        const hopDongHienTai = hd[0];
        let cotCapNhat = vaiTroKy === 'chu' ? 'chu_ky_chu' : 'chu_ky_khach';

        await ketNoi.query(`UPDATE hop_dong SET ${cotCapNhat} = ? WHERE id = ?`, [chuKyCanvas, idHopDong]);

        // Kiem tra xem ca 2 ben da ky chua hoac khach ky xong
        const chuKyChuDaCo = vaiTroKy === 'chu' ? true : !!hopDongHienTai.chu_ky_chu;
        const chuKyKhachDaCo = vaiTroKy === 'khach' ? true : !!hopDongHienTai.chu_ky_khach;

        if (chuKyChuDaCo && chuKyKhachDaCo) {
            // Cap nhat hop dong sang hieu luc
            await ketNoi.query('UPDATE hop_dong SET trang_thai = "hieu_luc" WHERE id = ?', [idHopDong]);

            // Tu dong chuyen trang thai phong sang 'da_thue'
            await ketNoi.query('UPDATE phong_tro SET trang_thai = "da_thue" WHERE id = ?', [hopDongHienTai.id_phong]);

            // Tu dong sinh hoa don hoa hong 10% thang dau vao tai khoan chu tro
            const hoaHongSan = Number(hopDongHienTai.gia_thue) * 0.10;
            const hanChot = new Date();
            hanChot.setDate(hanChot.getDate() + 15); // Han 15 ngay

            await ketNoi.query(
                `INSERT INTO hoa_hong (id_hop_dong, id_chu, so_tien, ty_le, trang_thai, han_chot)
                VALUES (?, ?, ?, 10.00, 'chua_thu', ?)`,
                [idHopDong, hopDongHienTai.id_chu, hoaHongSan, hanChot]
            );
        }

        return phanHoiThanhCong(res, 'Ký tên điện tử thành công! Trạng thái hợp đồng đã được cập nhật.');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi ký tên hợp đồng', loi.message, 500);
    }
}

async function giaHanHopDong1Click(req, res) {
    try {
        const { idHopDongCu, soThangGiaHan } = req.body;
        const [hdCu] = await ketNoi.query('SELECT * FROM hop_dong WHERE id = ?', [idHopDongCu]);
        if (hdCu.length === 0) return phanHoiThatBai(res, 'Không tìm thấy hợp đồng cũ');

        const cu = hdCu[0];
        const ngayBatDauMoi = new Date(cu.ngay_ket_thuc);
        ngayBatDauMoi.setDate(ngayBatDauMoi.getDate() + 1);

        const thang = Number(soThangGiaHan) || 12;
        const ngayKetThucMoi = new Date(ngayBatDauMoi);
        ngayKetThucMoi.setMonth(ngayKetThucMoi.getMonth() + thang);

        const maMoi = `HD-GH-${Date.now().toString().slice(-6)}-P${cu.id_phong}`;

        const [kq] = await ketNoi.query(
            `INSERT INTO hop_dong (id_phong, id_chu, id_khach, ma_hop_dong, gia_thue, tien_coc, ngay_bat_dau, ngay_ket_thuc, dieu_khoan, trang_thai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'cho_ky')`,
            [cu.id_phong, cu.id_chu, cu.id_khach, maMoi, cu.gia_thue, cu.tien_coc, ngayBatDauMoi, ngayKetThucMoi, cu.dieu_khoan]
        );

        return phanHoiThanhCong(res, 'Nhân bản hợp đồng gia hạn 1-Click thành công', { id: kq.insertId, maHopDong: maMoi });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi gia hạn hợp đồng', loi.message, 500);
    }
}

module.exports = {
    layDanhSachHopDong,
    taoHopDong,
    kyHopDongCanvas,
    giaHanHopDong1Click
};
