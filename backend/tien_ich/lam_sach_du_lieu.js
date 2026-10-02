const mysql = require('mysql2/promise');
require('dotenv').config();

async function lamSachDuLieu() {
    const ketNoi = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'quan_ly_phong_tro',
        port: process.env.DB_PORT || 3306
    });

    console.log('Đang làm sạch dữ liệu mẫu (bài đăng, hóa đơn, sự cố, hợp đồng)...');

    try {
        await ketNoi.query('SET FOREIGN_KEY_CHECKS = 0;');

        await ketNoi.query('TRUNCATE TABLE chi_tiet_chia_bill;');
        await ketNoi.query('TRUNCATE TABLE hoa_don;');
        await ketNoi.query('TRUNCATE TABLE hoa_hong;');
        await ketNoi.query('TRUNCATE TABLE nguoi_o_ghep;');
        await ketNoi.query('TRUNCATE TABLE hop_dong;');
        await ketNoi.query('TRUNCATE TABLE su_co;');
        await ketNoi.query('TRUNCATE TABLE tin_nhan;');
        await ketNoi.query('TRUNCATE TABLE canh_bao_sos;');
        await ketNoi.query('TRUNCATE TABLE bai_dang;');
        await ketNoi.query('TRUNCATE TABLE lich_su_bao_tri;');
        await ketNoi.query('TRUNCATE TABLE thiet_bi;');
        await ketNoi.query('TRUNCATE TABLE nhat_ky_he_thong;');

        await ketNoi.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('===========================================================');
        console.log('✅ ĐÃ XÓA TRẮNG TOÀN BỘ DỮ LIỆU MẪU THÀNH CÔNG!');
        console.log('Tài khoản người dùng và khu trọ vẫn được giữ nguyên.');
        console.log('Bây giờ bạn có thể tự tay tạo phòng, đăng bài và tính tiền thật 100%!');
        console.log('===========================================================');
    } catch (e) {
        console.error('Lỗi khi làm sạch dữ liệu:', e.message);
    } finally {
        await ketNoi.end();
    }
}

lamSachDuLieu();
