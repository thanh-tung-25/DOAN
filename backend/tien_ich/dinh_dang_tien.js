function dinhDangVND(soTien) {
    if (!soTien && soTien !== 0) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(soTien);
}

function tinhTienDienNuoc({ chiSoCu, chiSoMoi, donGia }) {
    const tieuThu = Math.max(0, Number(chiSoMoi) - Number(chiSoCu));
    const tongTien = tieuThu * Number(donGia);
    return {
        tieuThu,
        tongTien
    };
}

module.exports = {
    dinhDangVND,
    tinhTienDienNuoc
};
