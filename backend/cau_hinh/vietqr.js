/**
 * Tao duong dan ma VietQR dong cho giao dich thanh toan hoa don
 * @param {string} nganHang - Ma ngan hang (vi du: 'Vietcombank', 'MBBank', 'TCB')
 * @param {string} stk - So tai khoan
 * @param {string} chuTaiKhoan - Ten chu tai khoan
 * @param {number} soTien - So tien can thanh toan
 * @param {string} noiDung - Noi dung chuyen khoan
 */
function taoMaVietQRDong({ nganHang = 'Vietcombank', stk = '0123456789', chuTaiKhoan = 'NGUYEN VAN CHU', soTien = 0, noiDung = '' }) {
    const maNganHangChuan = nganHang.trim();
    const noiDungMaHoa = encodeURIComponent(noiDung.trim());
    const tenChuTaiKhoanMaHoa = encodeURIComponent(chuTaiKhoan.trim());
    
    // Su dung API VietQR tao anh QR kem so tien va noi dung
    return `https://img.vietqr.io/image/${maNganHangChuan}-${stk}-compact2.png?amount=${Math.round(soTien)}&addInfo=${noiDungMaHoa}&accountName=${tenChuTaiKhoanMaHoa}`;
}

module.exports = {
    taoMaVietQRDong
};
