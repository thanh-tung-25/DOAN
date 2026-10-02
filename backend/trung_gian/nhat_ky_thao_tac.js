const ketNoi = require('../cau_hinh/co_so_du_lieu');

async function ghiNhatKy(idNguoiDung, hanhDong, bangAnhHuong, idBanGhi = null, giaTriCu = null, giaTriMoi = null, diaChiIp = '') {
    try {
        await ketNoi.query(
            `INSERT INTO nhat_ky_he_thong 
            (id_nguoi_dung, hanh_dong, bang_anh_huong, id_ban_ghi, gia_tri_cu, gia_tri_moi, dia_chi_ip) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                idNguoiDung,
                hanhDong,
                bangAnhHuong,
                idBanGhi,
                typeof giaTriCu === 'object' ? JSON.stringify(giaTriCu) : giaTriCu,
                typeof giaTriMoi === 'object' ? JSON.stringify(giaTriMoi) : giaTriMoi,
                diaChiIp
            ]
        );
    } catch (loi) {
        console.error('Loi ghi audit log vao co so du lieu:', loi);
    }
}

module.exports = {
    ghiNhatKy
};
