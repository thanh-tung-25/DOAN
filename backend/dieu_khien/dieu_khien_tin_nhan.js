const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

/**
 * Lấy danh sách các cuộc hội thoại (bạn chat) kèm tin nhắn cuối và số tin chưa đọc
 */
async function layDanhSachHoiThoai(req, res) {
    try {
        const idNguoiDung = req.nguoiDung.id;

        const sql = `
            SELECT 
                u.id AS id_doi_phuong,
                u.ho_ten AS ten_doi_phuong,
                u.so_dien_thoai AS sdt_doi_phuong,
                u.vai_tro AS vai_tro_doi_phuong,
                u.anh_dai_dien AS avatar_doi_phuong,
                m.id AS id_tin_cuoi,
                m.noi_dung AS tin_nhan_cuoi,
                m.tao_luc AS thoi_gian_cuoi,
                m.id_nguoi_gui AS id_nguoi_gui_cuoi,
                COALESCE(chua_doc.so_luong, 0) AS tin_chua_doc
            FROM nguoi_dung u
            JOIN (
                SELECT 
                    CASE WHEN id_nguoi_gui = ? THEN id_nguoi_nhan ELSE id_nguoi_gui END AS id_ban_chat,
                    MAX(id) AS id_tin_cuoi
                FROM tin_nhan
                WHERE id_nguoi_gui = ? OR id_nguoi_nhan = ?
                GROUP BY id_ban_chat
            ) hoi_thoai ON u.id = hoi_thoai.id_ban_chat
            JOIN tin_nhan m ON m.id = hoi_thoai.id_tin_cuoi
            LEFT JOIN (
                SELECT id_nguoi_gui, COUNT(*) AS so_luong
                FROM tin_nhan
                WHERE id_nguoi_nhan = ? AND da_xem = 0
                GROUP BY id_nguoi_gui
            ) chua_doc ON u.id = chua_doc.id_nguoi_gui
            ORDER BY m.id DESC
        `;

        const [danhSach] = await ketNoi.query(sql, [idNguoiDung, idNguoiDung, idNguoiDung, idNguoiDung]);

        return phanHoiThanhCong(res, 'Lấy danh sách hội thoại thành công', danhSach);
    } catch (loi) {
        console.error('Lỗi layDanhSachHoiThoai:', loi);
        return phanHoiThatBai(res, 'Lỗi lấy danh sách hội thoại', loi.message, 500);
    }
}

/**
 * Lấy toàn bộ lịch sử tin nhắn thực tế giữa người dùng hiện tại và đối phương
 */
async function layLichSuTinNhan(req, res) {
    try {
        const idNguoiDung = req.nguoiDung.id;
        const idDoiPhuong = Number(req.params.idDoiPhuong);

        if (!idDoiPhuong || isNaN(idDoiPhuong)) {
            return phanHoiThatBai(res, 'ID đối phương không hợp lệ', null, 400);
        }

        // Lấy thông tin đối phương
        const [doiPhuong] = await ketNoi.query(
            'SELECT id, ho_ten, so_dien_thoai, vai_tro, anh_dai_dien FROM nguoi_dung WHERE id = ?',
            [idDoiPhuong]
        );

        if (doiPhuong.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy người dùng này', null, 404);
        }

        // Đánh dấu các tin nhắn gửi tới mình là đã xem
        await ketNoi.query(
            'UPDATE tin_nhan SET da_xem = 1 WHERE id_nguoi_gui = ? AND id_nguoi_nhan = ? AND da_xem = 0',
            [idDoiPhuong, idNguoiDung]
        );

        // Lấy danh sách tin nhắn theo thứ tự tăng dần thời gian
        const [tinNhan] = await ketNoi.query(`
            SELECT m.id, m.id_nguoi_gui, m.id_nguoi_nhan, m.noi_dung, m.hinh_anh, m.da_xem, m.tao_luc,
                   u.ho_ten AS ten_nguoi_gui
            FROM tin_nhan m
            JOIN nguoi_dung u ON m.id_nguoi_gui = u.id
            WHERE (m.id_nguoi_gui = ? AND m.id_nguoi_nhan = ?)
               OR (m.id_nguoi_gui = ? AND m.id_nguoi_nhan = ?)
            ORDER BY m.id ASC
        `, [idNguoiDung, idDoiPhuong, idDoiPhuong, idNguoiDung]);

        return phanHoiThanhCong(res, 'Lấy lịch sử tin nhắn thành công', {
            doi_phuong: doiPhuong[0],
            danh_sach_tin: tinNhan
        });
    } catch (loi) {
        console.error('Lỗi layLichSuTinNhan:', loi);
        return phanHoiThatBai(res, 'Lỗi tải lịch sử tin nhắn', loi.message, 500);
    }
}

/**
 * Gửi tin nhắn 1-1 và lưu trực tiếp vào cơ sở dữ liệu MySQL
 */
async function guiTinNhan(req, res) {
    try {
        const idNguoiGui = req.nguoiDung.id;
        const { idNguoiNhan, noiDung, hinhAnh } = req.body;

        if (!idNguoiNhan) {
            return phanHoiThatBai(res, 'Vui lòng chỉ định người nhận tin nhắn', null, 400);
        }

        if (!noiDung || noiDung.trim().length === 0) {
            return phanHoiThatBai(res, 'Nội dung tin nhắn không được để trống', null, 400);
        }

        if (Number(idNguoiGui) === Number(idNguoiNhan)) {
            return phanHoiThatBai(res, 'Không thể tự gửi tin nhắn cho chính mình', null, 400);
        }

        const [kq] = await ketNoi.query(
            'INSERT INTO tin_nhan (id_nguoi_gui, id_nguoi_nhan, noi_dung, hinh_anh, da_xem) VALUES (?, ?, ?, ?, 0)',
            [idNguoiGui, Number(idNguoiNhan), noiDung.trim(), hinhAnh || null]
        );

        const [tinVuaTao] = await ketNoi.query(`
            SELECT m.*, u.ho_ten AS ten_nguoi_gui
            FROM tin_nhan m
            JOIN nguoi_dung u ON m.id_nguoi_gui = u.id
            WHERE m.id = ?
        `, [kq.insertId]);

        return phanHoiThanhCong(res, 'Gửi tin nhắn thành công', tinVuaTao[0], 201);
    } catch (loi) {
        console.error('Lỗi guiTinNhan:', loi);
        return phanHoiThatBai(res, 'Lỗi gửi tin nhắn', loi.message, 500);
    }
}

/**
 * Nghiệp vụ khách thuê bấm "Đăng ký ở ghép" từ tin đăng:
 * Tự động tạo tin nhắn mở đầu chứa thông tin phòng, link bài đăng và lời nhắn của khách
 */
async function dangKyOGhepVaMoChat(req, res) {
    try {
        const idKhach = req.nguoiDung.id;
        const { idBaiDang, loiNhan } = req.body;

        if (!idBaiDang) {
            return phanHoiThatBai(res, 'Vui lòng cung cấp mã bài đăng phòng trọ', null, 400);
        }

        // Lấy thông tin bài đăng và chủ trọ
        const [baiDang] = await ketNoi.query(`
            SELECT b.id, b.tieu_de, b.gia_thue, b.dien_tich, b.id_chu,
                   u.ho_ten AS ten_chu, u.so_dien_thoai AS sdt_chu,
                   p.ma_phong
            FROM bai_dang b
            JOIN nguoi_dung u ON b.id_chu = u.id
            JOIN phong_tro p ON b.id_phong = p.id
            WHERE b.id = ?
        `, [idBaiDang]);

        if (baiDang.length === 0) {
            return phanHoiThatBai(res, 'Không tìm thấy bài đăng này', null, 404);
        }

        const bai = baiDang[0];

        if (Number(bai.id_chu) === Number(idKhach)) {
            return phanHoiThatBai(res, 'Bạn không thể đăng ký ở ghép cho bài đăng do chính mình quản lý', null, 400);
        }

        // Tạo nội dung tin nhắn khởi tạo chuẩn mực
        const loiNhanThucTe = (loiNhan && loiNhan.trim().length > 0)
            ? loiNhan.trim()
            : 'Xin chào chủ trọ, tôi rất quan tâm đến phòng trọ này và muốn đăng ký xem phòng/ở ghép ạ!';

        const noiDungTin = `[ĐĂNG KÝ Ở GHÉP - ${bai.tieu_de}]
Khách thuê: ${req.nguoiDung.ho_ten || 'Khách thuê'} (SĐT: ${req.nguoiDung.so_dien_thoai || 'Chưa cập nhật'})
Phòng: ${bai.ma_phong} | Diện tích: ${bai.dien_tich} m²
Lời nhắn: "${loiNhanThucTe}"
🔗 Link xem phòng: /cac_trang/cong_khai/chi_tiet_phong/chi_tiet_phong.html?id=${bai.id}`;

        const [kq] = await ketNoi.query(
            'INSERT INTO tin_nhan (id_nguoi_gui, id_nguoi_nhan, noi_dung, da_xem) VALUES (?, ?, ?, 0)',
            [idKhach, bai.id_chu, noiDungTin]
        );

        const [tinMoi] = await ketNoi.query(`
            SELECT m.*, u.ho_ten AS ten_nguoi_gui
            FROM tin_nhan m
            JOIN nguoi_dung u ON m.id_nguoi_gui = u.id
            WHERE m.id = ?
        `, [kq.insertId]);

        return phanHoiThanhCong(res, 'Đã kết nối luồng chat trực tiếp với Chủ trọ thành công!', {
            id_doi_phuong: bai.id_chu,
            ten_doi_phuong: bai.ten_chu,
            sdt_doi_phuong: bai.sdt_chu,
            tin_nhan_moi: tinMoi[0]
        }, 201);
    } catch (loi) {
        console.error('Lỗi dangKyOGhepVaMoChat:', loi);
        return phanHoiThatBai(res, 'Lỗi đăng ký ở ghép và kết nối chat', loi.message, 500);
    }
}

module.exports = {
    layDanhSachHoiThoai,
    layLichSuTinNhan,
    guiTinNhan,
    dangKyOGhepVaMoChat
};
