const khoiTaoKenhTinNhan = require('./kenh_tin_nhan');
const khoiTaoKenhSOS = require('./kenh_bao_dong_sos');
const khoiTaoKenhThongBao = require('./kenh_thong_bao');

function khoiTaoSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client kết nối: ${socket.id}`);

        // Tham gia vao phong rieng theo ID nguoi dung va theo vai tro
        socket.on('DANG_KY_KENH', ({ idNguoiDung, vaiTro }) => {
            if (idNguoiDung) {
                socket.join(`nguoi_dung_${idNguoiDung}`);
                console.log(`Socket ${socket.id} gia nhập phòng người dùng: nguoi_dung_${idNguoiDung}`);
            }
            if (vaiTro === 'chu_doanh_nghiep' && idNguoiDung) {
                socket.join(`chu_${idNguoiDung}`);
                console.log(`Socket ${socket.id} gia nhập phòng chủ trọ: chu_${idNguoiDung}`);
            }
        });

        // Dang ky cac module xu ly kenh
        khoiTaoKenhTinNhan(io, socket);
        khoiTaoKenhSOS(io, socket);
        khoiTaoKenhThongBao(io, socket);

        socket.on('disconnect', () => {
            console.log(`[Socket.IO] Client ngắt kết nối: ${socket.id}`);
        });
    });
}

module.exports = khoiTaoSocket;
