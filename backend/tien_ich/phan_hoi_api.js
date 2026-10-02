function phanHoiThanhCong(res, thongDiep = 'Thành công', duLieu = null, maTrangThai = 200) {
    return res.status(maTrangThai).json({
        thanh_cong: true,
        thong_diep: thongDiep,
        du_lieu: duLieu
    });
}

function phanHoiThatBai(res, thongDiep = 'Thất bại', maLoi = null, maTrangThai = 400) {
    return res.status(maTrangThai).json({
        thanh_cong: false,
        thong_diep: thongDiep,
        ma_loi: maLoi
    });
}

module.exports = {
    phanHoiThanhCong,
    phanHoiThatBai
};
