const ketNoi = require('../cau_hinh/co_so_du_lieu');

function khoiTaoKenhTinNhan(io, socket) {
    // Gui tin nhan 1-1
    socket.on('GUI_TIN_NHAN', async (duLieu) => {
        try {
            const { idNguoiGui, idNguoiNhan, noiDung, hinhAnh } = duLieu;

            const [ketQua] = await ketNoi.query(
                `INSERT INTO tin_nhan (id_nguoi_gui, id_nguoi_nhan, noi_dung, hinh_anh) VALUES (?, ?, ?, ?)`,
                [idNguoiGui, idNguoiNhan, noiDung || '', hinhAnh || null]
            );

            const [nguoiGui] = await ketNoi.query('SELECT ho_ten, anh_dai_dien FROM nguoi_dung WHERE id = ?', [idNguoiGui]);

            const tinNhanMoi = {
                id: ketQua.insertId,
                id_nguoi_gui: Number(idNguoiGui),
                id_nguoi_nhan: Number(idNguoiNhan),
                noi_dung: noiDung,
                hinh_anh: hinhAnh || null,
                da_xem: 0,
                ten_nguoi_gui: nguoiGui[0]?.ho_ten || 'Người dùng',
                avatar_nguoi_gui: nguoiGui[0]?.anh_dai_dien || null,
                tao_luc: new Date().toISOString()
            };

            // Gui den nguoi nhan va phan hoi lai nguoi gui
            io.to(`nguoi_dung_${idNguoiNhan}`).emit('NHAN_TIN_NHAN', tinNhanMoi);
            socket.emit('TIN_NHAN_DA_GUI', tinNhanMoi);
        } catch (loi) {
            console.error('Loi gui tin nhan qua Socket:', loi);
        }
    });

    // Dang go tin nhan (typing indicator)
    socket.on('DANG_GO_TIN_NHAN', ({ idNguoiGui, idNguoiNhan }) => {
        socket.to(`nguoi_dung_${idNguoiNhan}`).emit('NGUOI_DUNG_DANG_GO', { idNguoiGui });
    });

    // Dung go tin nhan
    socket.on('DUNG_GO_TIN_NHAN', ({ idNguoiGui, idNguoiNhan }) => {
        socket.to(`nguoi_dung_${idNguoiNhan}`).emit('NGUOI_DUNG_DUNG_GO', { idNguoiGui });
    });

    // Danh dau da xem (seen)
    socket.on('DA_XEM_TIN_NHAN', async ({ idNguoiGui, idNguoiNhan }) => {
        try {
            await ketNoi.query(
                'UPDATE tin_nhan SET da_xem = 1 WHERE id_nguoi_gui = ? AND id_nguoi_nhan = ? AND da_xem = 0',
                [idNguoiGui, idNguoiNhan]
            );
            socket.to(`nguoi_dung_${idNguoiGui}`).emit('TIN_NHAN_DA_DUOC_XEM', { idNguoiXem: idNguoiNhan });
        } catch (loi) {
            console.error('Loi cap nhat da xem tin nhan:', loi);
        }
    });
}

module.exports = khoiTaoKenhTinNhan;
