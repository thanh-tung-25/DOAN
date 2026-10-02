const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function layDanhSachFAQ(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const [danhSach] = await ketNoi.query('SELECT * FROM cau_hoi_faq WHERE id_chu = ? ORDER BY id DESC', [idChu]);
        return phanHoiThanhCong(res, 'Lấy danh sách câu hỏi FAQ thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy FAQ', loi.message, 500);
    }
}

async function luuFAQ(req, res) {
    try {
        const idChu = req.nguoiDung.id;
        const { id, cauHoi, cauTraLoi, tuKhoa } = req.body;

        if (id) {
            await ketNoi.query(
                'UPDATE cau_hoi_faq SET cau_hoi = ?, cau_tra_loi = ?, tu_khoa = ? WHERE id = ? AND id_chu = ?',
                [cauHoi, cauTraLoi, tuKhoa, id, idChu]
            );
            return phanHoiThanhCong(res, 'Cập nhật câu hỏi FAQ thành công');
        } else {
            const [kq] = await ketNoi.query(
                'INSERT INTO cau_hoi_faq (id_chu, cau_hoi, cau_tra_loi, tu_khoa) VALUES (?, ?, ?, ?)',
                [idChu, cauHoi, cauTraLoi, tuKhoa]
            );
            return phanHoiThanhCong(res, 'Thêm câu hỏi FAQ thành công', { id: kq.insertId });
        }
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lưu FAQ', loi.message, 500);
    }
}

async function xoaFAQ(req, res) {
    try {
        const { id } = req.params;
        const idChu = req.nguoiDung.id;
        await ketNoi.query('DELETE FROM cau_hoi_faq WHERE id = ? AND id_chu = ?', [id, idChu]);
        return phanHoiThanhCong(res, 'Xóa câu hỏi FAQ thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xóa FAQ', loi.message, 500);
    }
}

async function hoiDapChatbot(req, res) {
    try {
        const { cauHoi, idChu } = req.body;
        if (!cauHoi) return phanHoiThatBai(res, 'Vui lòng nhập câu hỏi');

        const [faqList] = await ketNoi.query(
            'SELECT * FROM cau_hoi_faq WHERE id_chu = ?',
            [idChu || 2]
        );

        function boDauTiengViet(str) {
            return (str || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .toLowerCase();
        }

        const cauHoiChuan = cauHoi.toLowerCase();
        const cauHoiKhongDau = boDauTiengViet(cauHoi);
        let traLoiPhuHop = null;

        for (const item of faqList) {
            const cacTuKhoa = item.tu_khoa.toLowerCase().split(',').map(k => k.trim());
            const trungKhop = cacTuKhoa.some(tu => {
                const tuKhongDau = boDauTiengViet(tu);
                return cauHoiChuan.includes(tu) || cauHoiKhongDau.includes(tuKhongDau);
            });
            if (trungKhop) {
                traLoiPhuHop = item.cau_tra_loi;
                break;
            }
        }

        if (!traLoiPhuHop) {
            traLoiPhuHop = 'Xin chào! Câu hỏi này tôi chưa được chủ trọ huấn luyện. Tôi đã chuyển tiếp tin nhắn của bạn đến chủ trọ để hỗ trợ trực tiếp sớm nhất!';
        }

        return phanHoiThanhCong(res, 'Phản hồi chatbot', { traLoi: traLoiPhuHop });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi chatbot FAQ', loi.message, 500);
    }
}

module.exports = {
    layDanhSachFAQ,
    luuFAQ,
    xoaFAQ,
    hoiDapChatbot
};
