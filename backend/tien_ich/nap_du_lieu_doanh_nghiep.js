const mysql = require('mysql2/promise');
require('dotenv').config();

async function napDuLieuDoanhNghiep() {
    const ketNoi = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'quan_ly_phong_tro',
        port: process.env.DB_PORT || 3306
    });

    console.log('🚀 Bắt đầu nạp dữ liệu mẫu quy mô Doanh Nghiệp Lớn...');

    try {
        await ketNoi.query('SET FOREIGN_KEY_CHECKS = 0;');
        await ketNoi.query('TRUNCATE TABLE lich_su_bao_tri;');
        await ketNoi.query('TRUNCATE TABLE thiet_bi;');
        await ketNoi.query('TRUNCATE TABLE phong_tro;');
        await ketNoi.query('DELETE FROM khu_tro WHERE id_chu_doanh_nghiep = 2;');
        await ketNoi.query('SET FOREIGN_KEY_CHECKS = 1;');

        // 1. TẠO 3 TÒA NHÀ DOANH NGHIỆP
        const toaNhaList = [
            {
                id: 101,
                ten: 'Tòa Nhà Sapphire Tower (Quận 7)',
                tinh: 'Thành phố Hồ Chí Minh',
                quan: 'Quận 7',
                phuong: 'Phường Tân Phong',
                diaChi: '123 Đường Nguyễn Thị Thập',
                lat: 10.732993,
                lng: 106.708893
            },
            {
                id: 102,
                ten: 'Tòa Nhà Emerald Luxury (Bình Thạnh)',
                tinh: 'Thành phố Hồ Chí Minh',
                quan: 'Quận Bình Thạnh',
                phuong: 'Phường 25',
                diaChi: '456 Đường Điện Biên Phủ',
                lat: 10.801234,
                lng: 106.714567
            },
            {
                id: 103,
                ten: 'Tòa Căn Hộ Dịch Vụ Sunshine (Cầu Giấy)',
                tinh: 'Thành phố Hà Nội',
                quan: 'Quận Cầu Giấy',
                phuong: 'Phường Dịch Vọng',
                diaChi: '88 Đường Cầu Giấy',
                lat: 21.033333,
                lng: 105.793889
            }
        ];

        for (const tn of toaNhaList) {
            await ketNoi.query(
                `INSERT INTO khu_tro (id, id_chu_doanh_nghiep, ten_khu_tro, tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet, toa_do_lat, toa_do_lng)
                 VALUES (?, 2, ?, ?, ?, ?, ?, ?, ?)`,
                [tn.id, tn.ten, tn.tinh, tn.quan, tn.phuong, tn.diaChi, tn.lat, tn.lng]
            );
        }

        // 2. TẠO PHÒNG THEO TẦNG CHO MỖI TÒA NHÀ
        // Tòa 101: 4 Tầng (Tầng 1: 3 phòng, Tầng 2: 3 phòng, Tầng 3: 3 phòng, Tầng 4: 2 phòng) -> 11 phòng
        // Tòa 102: 3 Tầng (Tầng 1: 3 phòng, Tầng 2: 3 phòng, Tầng 3: 2 phòng) -> 8 phòng
        // Tòa 103: 3 Tầng (Tầng 1: 2 phòng, Tầng 2: 2 phòng, Tầng 3: 2 phòng) -> 6 phòng
        const danhSachPhongMau = [
            // TÒA 101 - SAPPHIRE TOWER
            // Tầng 1
            { id: 201, idKhu: 101, ma: 'P.101', tang: 1, gia: 4200000, dt: 28, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"]' },
            { id: 202, idKhu: 101, ma: 'P.102', tang: 1, gia: 4500000, dt: 32, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"]' },
            { id: 203, idKhu: 101, ma: 'P.103', tang: 1, gia: 4000000, dt: 26, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"]' },
            // Tầng 2
            { id: 204, idKhu: 101, ma: 'P.201', tang: 2, gia: 4600000, dt: 30, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600"]' },
            { id: 205, idKhu: 101, ma: 'P.202', tang: 2, gia: 4800000, dt: 35, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]' },
            { id: 206, idKhu: 101, ma: 'P.203', tang: 2, gia: 4400000, dt: 28, tt: 'dang_sua_chua', anh: '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"]' },
            // Tầng 3
            { id: 207, idKhu: 101, ma: 'P.301', tang: 3, gia: 5000000, dt: 32, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1502005229762-ee1b2b814a77?w=600"]' },
            { id: 208, idKhu: 101, ma: 'P.302', tang: 3, gia: 5200000, dt: 36, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600"]' },
            { id: 209, idKhu: 101, ma: 'P.303', tang: 3, gia: 4900000, dt: 30, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600"]' },
            // Tầng 4
            { id: 210, idKhu: 101, ma: 'P.401', tang: 4, gia: 6000000, dt: 42, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1540518614846-7ede433c4b13?w=600"]' },
            { id: 211, idKhu: 101, ma: 'P.402', tang: 4, gia: 6500000, dt: 45, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600"]' },

            // TÒA 102 - EMERALD LUXURY (BÌNH THẠNH)
            // Tầng 1
            { id: 212, idKhu: 102, ma: 'E.101', tang: 1, gia: 5000000, dt: 32, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"]' },
            { id: 213, idKhu: 102, ma: 'E.102', tang: 1, gia: 5200000, dt: 35, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"]' },
            { id: 214, idKhu: 102, ma: 'E.103', tang: 1, gia: 4800000, dt: 30, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"]' },
            // Tầng 2
            { id: 215, idKhu: 102, ma: 'E.201', tang: 2, gia: 5500000, dt: 36, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600"]' },
            { id: 216, idKhu: 102, ma: 'E.202', tang: 2, gia: 5600000, dt: 38, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]' },
            { id: 217, idKhu: 102, ma: 'E.203', tang: 2, gia: 5300000, dt: 34, tt: 'dang_sua_chua', anh: '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"]' },
            // Tầng 3
            { id: 218, idKhu: 102, ma: 'E.301', tang: 3, gia: 6800000, dt: 45, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1502005229762-ee1b2b814a77?w=600"]' },
            { id: 219, idKhu: 102, ma: 'E.302', tang: 3, gia: 7000000, dt: 48, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600"]' },

            // TÒA 103 - SUNSHINE (CẦU GIẤY)
            // Tầng 1
            { id: 220, idKhu: 103, ma: 'S.101', tang: 1, gia: 3800000, dt: 25, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"]' },
            { id: 221, idKhu: 103, ma: 'S.102', tang: 1, gia: 4000000, dt: 28, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"]' },
            // Tầng 2
            { id: 222, idKhu: 103, ma: 'S.201', tang: 2, gia: 4200000, dt: 30, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"]' },
            { id: 223, idKhu: 103, ma: 'S.202', tang: 2, gia: 4300000, dt: 30, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600"]' },
            // Tầng 3
            { id: 224, idKhu: 103, ma: 'S.301', tang: 3, gia: 4800000, dt: 35, tt: 'da_thue', anh: '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600"]' },
            { id: 225, idKhu: 103, ma: 'S.302', tang: 3, gia: 5000000, dt: 36, tt: 'con_trong', anh: '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"]' }
        ];

        for (const p of danhSachPhongMau) {
            await ketNoi.query(
                `INSERT INTO phong_tro (id, id_khu_tro, ma_phong, tang, gia_thue, tien_coc, dien_tich, don_gia_dien, don_gia_nuoc, phi_dich_vu, trang_thai, mo_ta, hinh_anh, tien_ich)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 3500, 20000, 100000, ?, ?, ?, ?)`,
                [
                    p.id, p.idKhu, p.ma, p.tang, p.gia, p.gia, p.dt, p.tt,
                    `Phòng cao cấp ${p.ma} tại tầng ${p.tang}, đầy đủ thiết bị, an ninh tuyệt đối.`,
                    p.anh,
                    JSON.stringify(['Máy lạnh / Điều hòa', 'Tủ lạnh', 'Máy giặt', 'Bình nóng lạnh', 'Bếp từ & Kệ bếp', 'Khóa cửa vân tay', 'Giường nệm cao cấp', 'Tủ quần áo'])
                ]
            );
        }

        // 3. TẠO DANH MỤC THIẾT BỊ CHO CÁC PHÒNG (Gồm thiết bị tốt và thiết bị cảnh báo >60%)
        let tbIdCounter = 1;
        for (const p of danhSachPhongMau) {
            // Mỗi phòng được trang bị các thiết bị chuẩn:
            const thietBiCuaPhong = [
                { ten: 'Máy lạnh Daikin Inverter 1.5HP', gia: 8500000, sua: 0, tt: 'hoat_dong_tot' },
                { ten: 'Tủ lạnh Panasonic 220L', gia: 6200000, sua: 0, tt: 'hoat_dong_tot' },
                { ten: 'Bình nóng lạnh Ariston 20L', gia: 3000000, sua: 0, tt: 'hoat_dong_tot' },
                { ten: 'Máy giặt Toshiba 8.5kg', gia: 5200000, sua: 0, tt: 'hoat_dong_tot' },
                { ten: 'Khóa cửa vân tay Kaadas', gia: 2500000, sua: 0, tt: 'hoat_dong_tot' },
                { ten: 'Bếp điện từ đôi Hafele', gia: 4200000, sua: 0, tt: 'hoat_dong_tot' }
            ];

            // Riêng các phòng sửa chữa hoặc một vài phòng thuê, gán thiết bị có cảnh báo >60%
            if (p.ma === 'P.101') {
                // Tủ lạnh đã sửa nhiều lần vượt 60%
                thietBiCuaPhong[1].sua = 4200000; // 4.2tr / 6.2tr = 67.7% -> đề xuất mua mới
                thietBiCuaPhong[1].tt = 'de_xuat_mua_moi';
            } else if (p.ma === 'P.203') {
                // Máy lạnh hỏng hóc cần sửa
                thietBiCuaPhong[0].sua = 5500000; // 5.5tr / 8.5tr = 64.7% -> đề xuất mua mới
                thietBiCuaPhong[0].tt = 'de_xuat_mua_moi';
                thietBiCuaPhong[2].tt = 'hong_hoc';
            } else if (p.ma === 'E.203') {
                // Máy giặt sửa nhiều lần
                thietBiCuaPhong[3].sua = 3500000; // 3.5tr / 5.2tr = 67.3%
                thietBiCuaPhong[3].tt = 'de_xuat_mua_moi';
            } else if (p.ma === 'S.101') {
                thietBiCuaPhong[0].sua = 5200000;
                thietBiCuaPhong[0].tt = 'de_xuat_mua_moi';
            }

            for (const tb of thietBiCuaPhong) {
                const currentTbId = tbIdCounter++;
                await ketNoi.query(
                    `INSERT INTO thiet_bi (id, id_phong, ten_thiet_bi, gia_tri, chi_phi_sua_luy_ke, trang_thai, ngay_lap_dat)
                     VALUES (?, ?, ?, ?, ?, ?, '2023-03-15')`,
                    [currentTbId, p.id, tb.ten, tb.gia, tb.sua, tb.tt]
                );

                if (tb.sua > 0) {
                    await ketNoi.query(
                        `INSERT INTO lich_su_bao_tri (id_thiet_bi, chi_phi, noi_dung, ngay_bao_tri)
                         VALUES (?, ?, 'Thay bo mạch và bảo dưỡng linh kiện định kỳ', '2024-04-10')`,
                        [currentTbId, tb.sua]
                    );
                }
            }
        }

        console.log(`✅ Đã nạp thành công:`);
        console.log(`   - 3 Tòa nhà`);
        console.log(`   - ${danhSachPhongMau.length} Phòng trọ phân bổ khắp các tầng 1, 2, 3, 4`);
        console.log(`   - ${tbIdCounter - 1} Thiết bị vật lý có tính toán khấu hao và cảnh báo >60%!`);
    } catch (err) {
        console.error('❌ Lỗi khi nạp dữ liệu doanh nghiệp:', err);
    } finally {
        await ketNoi.end();
    }
}

napDuLieuDoanhNghiep();
