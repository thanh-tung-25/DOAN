let socketClient = null;

function khoiTaoKetNoiSocket() {
    if (typeof io === 'undefined') {
        console.warn('Thư viện Socket.IO client chưa được tải!');
        return null;
    }

    if (!socketClient) {
        const diaChiBackend = (window.location.port === '5000') ? undefined : 'http://localhost:5000';
        socketClient = io(diaChiBackend);

        const user = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
        if (user) {
            socketClient.emit('DANG_KY_KENH', {
                idNguoiDung: user.id,
                vaiTro: user.vai_tro
            });
        }

        // Lang nghe bao dong SOS toan cuc hoac phong chu
        socketClient.on('COI_HU_SOS', (duLieu) => {
            console.warn('[SOS RECEIVED]', duLieu);
            if (window.kichHoatBaoDongSOS) {
                window.kichHoatBaoDongSOS(duLieu);
            }
        });

        socketClient.on('COI_HU_SOS_TOAN_CUC', (duLieu) => {
            const userHienTai = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
            if (userHienTai && (userHienTai.vai_tro === 'chu_doanh_nghiep' || userHienTai.vai_tro === 'nhan_vien')) {
                if (window.kichHoatBaoDongSOS) {
                    window.kichHoatBaoDongSOS(duLieu);
                }
            }
        });
    }

    return socketClient;
}

window.khoiTaoKetNoiSocket = khoiTaoKetNoiSocket;
