function khoiTaoKenhThongBao(io, socket) {
    // Phat thong bao he thong hoac cap nhat tien do
    socket.on('THONG_BAO_CAP_NHAT', (duLieu) => {
        io.emit('NHAN_THONG_BAO_HE_THONG', duLieu);
    });
}

module.exports = khoiTaoKenhThongBao;
