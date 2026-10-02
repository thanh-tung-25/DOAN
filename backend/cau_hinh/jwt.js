require('dotenv').config();

module.exports = {
    biMatJWT: process.env.JWT_SECRET || 'khoa_bi_mat_he_thong_phong_tro_2026',
    thoiHanJWT: process.env.JWT_EXPIRES_IN || '7d'
};
