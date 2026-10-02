const ketNoi = require('../cau_hinh/co_so_du_lieu');

function khoiTaoKenhSOS(io, socket) {
    // Nguoi thue kich hoat bao dong khan cap SOS
    socket.on('PHAT_TIN_HIEU_SOS', async (duLieu) => {
        try {
            const { idKhach, idPhong, idChu, maPhong, hoTenKhach, noiDung } = duLieu;
            console.log(`[SOS ALARM] Kích hoạt từ khách ID: ${idKhach}, Phòng: ${maPhong}`);

            // Luu canh bao vao CSDL
            const [ketQua] = await ketNoi.query(
                `INSERT INTO canh_bao_sos (id_phong, id_khach, id_chu, noi_dung) VALUES (?, ?, ?, ?)`,
                [idPhong || 1, idKhach || 4, idChu || 2, noiDung || `BÁO ĐỘNG KHẨN CẤP TỪ PHÒNG ${maPhong || 'P.101'}`]
            );

            const goiTinSOS = {
                idCanhBao: ketQua.insertId,
                idPhong,
                maPhong: maPhong || 'P.101',
                idKhach,
                hoTenKhach: hoTenKhach || 'Khách thuê',
                noiDung: noiDung || `BÁO ĐỘNG KHẨN CẤP TỪ PHÒNG ${maPhong || 'P.101'}! CẦN ỨNG CỨU NGAY LẬP TỨC!`,
                thoiGian: new Date().toLocaleTimeString('vi-VN')
            };

            // Phat song truc tiep den phong socket cua chu tro va tat ca nhan vien quan ly
            io.to(`chu_${idChu}`).emit('COI_HU_SOS', goiTinSOS);
            io.emit('COI_HU_SOS_TOAN_CUC', goiTinSOS); // Du phong broadcast
        } catch (loi) {
            console.error('Loi xu ly kenh SOS Socket:', loi);
        }
    });

    // Chu tro xac nhan da xu ly su co SOS
    socket.on('DA_XU_LY_SOS', async (idCanhBao) => {
        try {
            await ketNoi.query('UPDATE canh_bao_sos SET trang_thai = "da_xu_ly" WHERE id = ?', [idCanhBao]);
            io.emit('TAT_COI_SOS', { idCanhBao });
        } catch (loi) {
            console.error('Loi cap nhat trang thai SOS:', loi);
        }
    });
}

module.exports = khoiTaoKenhSOS;
