function khoiTaoNutSOS() {
    const user = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    const vungSOS = document.getElementById('vung-nut-sos');
    const nutSOS = document.getElementById('nut-bam-sos');

    // Chi hien thi nut SOS cho khach thue
    if (!user || user.vai_tro !== 'khach_thue') {
        if (vungSOS) vungSOS.style.display = 'none';
        return;
    }

    if (nutSOS) {
        nutSOS.addEventListener('click', async () => {
            const xacNhan = window.hienXacNhan
                ? await window.hienXacNhan('CẢNH BÁO KHẨN CẤP!', 'Bạn có chắc chắn muốn kích hoạt còi báo động SOS gửi tới Chủ trọ và Ban quản lý ngay lập tức?', '🚨 PHÁT BÁO ĐỘNG NGAY', 'Hủy bỏ')
                : confirm('CẢNH BÁO KHẨN CẤP!\nBạn có chắc chắn muốn kích hoạt còi báo động SOS gửi tới Chủ trọ và Ban quản lý ngay lập tức?');

            if (xacNhan) {
                const socket = window.khoiTaoKetNoiSocket ? window.khoiTaoKetNoiSocket() : null;
                if (socket) {
                    socket.emit('PHAT_TIN_HIEU_SOS', {
                        idKhach: user.id,
                        idPhong: 1,
                        idChu: 2,
                        maPhong: 'P.101',
                        hoTenKhach: user.ho_ten,
                        noiDung: `KHẨN CẤP: Khách thuê ${user.ho_ten} (SĐT: ${user.so_dien_thoai}) kích hoạt SOS tại phòng!`
                    });
                    if (window.hienThongBao) {
                        window.hienThongBao('ĐÃ PHÁT TÍN HIỆU CỨU HỘ KHẨN CẤP! Chủ trọ và BQL đã nhận được còi báo động.', 'thanh_cong');
                    } else {
                        alert('ĐÃ PHÁT TÍN HIỆU CỨU HỘ KHẨN CẤP!\nChủ trọ và Ban Quản Trị đã nhận được còi báo động và đang ứng cứu.');
                    }
                } else {
                    if (window.hienThongBao) {
                        window.hienThongBao('Không thể kết nối đến máy chủ realtime!', 'loi');
                    } else {
                        alert('Không thể kết nối đến máy chủ realtime!');
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', khoiTaoNutSOS);
