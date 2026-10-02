function testBaoDongSOS() {
    if (window.kichHoatBaoDongSOS) {
        window.kichHoatBaoDongSOS({
            maPhong: 'P.101',
            hoTenKhach: 'Lê Thị Thu',
            noiDung: 'BÁO ĐỘNG SOS THỰC THỬ NGHIỆM! CÒI HÚ VÀ CHỚP ĐỎ HOẠT ĐỘNG TỐT!',
            thoiGian: new Date().toLocaleTimeString('vi-VN')
        });
    }
}

window.testBaoDongSOS = testBaoDongSOS;
