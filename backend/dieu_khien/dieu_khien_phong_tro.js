const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');

async function layDanhSachPhong(req, res) {
    try {
        let cauTruyVan = `
            SELECT p.*, kt.ten_khu_tro, kt.tinh_thanh, kt.quan_huyen, kt.phuong_xa, kt.dia_chi_chi_tiet,
                   kt.toa_do_lat, kt.toa_do_lng,
                   hd.ngay_ket_thuc AS ngay_het_han_hd, hd.ma_hop_dong,
                   COALESCE(tb_stat.tong_thiet_bi, 0) AS tong_thiet_bi,
                   COALESCE(tb_stat.so_tb_canh_bao, 0) AS so_tb_canh_bao,
                   COALESCE(tb_stat.so_tb_hong, 0) AS so_tb_hong,
                   COALESCE(tb_stat.tong_gia_tri_tb, 0) AS tong_gia_tri_tb
            FROM phong_tro p
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            LEFT JOIN hop_dong hd ON p.id = hd.id_phong AND hd.trang_thai = 'hieu_luc'
            LEFT JOIN (
                SELECT id_phong, 
                       COUNT(*) AS tong_thiet_bi,
                       SUM(CASE WHEN (gia_tri > 0 AND (chi_phi_sua_luy_ke / gia_tri) >= 0.6) OR trang_thai = 'de_xuat_mua_moi' THEN 1 ELSE 0 END) AS so_tb_canh_bao,
                       SUM(CASE WHEN trang_thai = 'hong_hoc' OR trang_thai = 'can_bao_duong' THEN 1 ELSE 0 END) AS so_tb_hong,
                       SUM(gia_tri) AS tong_gia_tri_tb
                FROM thiet_bi
                GROUP BY id_phong
            ) tb_stat ON p.id = tb_stat.id_phong
            WHERE 1=1
        `;
        const thamSo = [];

        // Co lap du lieu neu la nhan vien
        if (req.danhSachKhuTroDuocGiao && req.danhSachKhuTroDuocGiao.length > 0) {
            cauTruyVan += ` AND p.id_khu_tro IN (${req.danhSachKhuTroDuocGiao.map(() => '?').join(',')})`;
            thamSo.push(...req.danhSachKhuTroDuocGiao);
        } else if (req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            cauTruyVan += ' AND kt.id_chu_doanh_nghiep = ?';
            thamSo.push(req.nguoiDung.id);
        }

        cauTruyVan += ' ORDER BY p.id_khu_tro ASC, p.tang ASC, p.ma_phong ASC';
        const [danhSach] = await ketNoi.query(cauTruyVan, thamSo);

        // Kiem tra hop dong sap het han trong 30 ngay
        const homNay = new Date();
        const danhSachBoSung = danhSach.map(item => {
            let sapHetHan = false;
            if (item.ngay_het_han_hd) {
                const ngayHetHan = new Date(item.ngay_het_han_hd);
                const soNgayConLai = Math.ceil((ngayHetHan - homNay) / (1000 * 60 * 60 * 24));
                if (soNgayConLai <= 30 && soNgayConLai >= 0) {
                    sapHetHan = true;
                }
            }
            return {
                ...item,
                canh_bao_sap_het_han: sapHetHan
            };
        });

        return phanHoiThanhCong(res, 'Lấy danh sách phòng thành công', danhSachBoSung);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách phòng trọ', loi.message, 500);
    }
}

async function themPhong(req, res) {
    try {
        const { 
            idKhuTro, 
            tenKhuTro, 
            tinhThanh, 
            quanHuyen, 
            phuongXa, 
            diaChiChiTiet, 
            maPhong, 
            tang, 
            giaThue, 
            tienCoc, 
            dienTich, 
            donGiaDien, 
            donGiaNuoc, 
            phiDichVu, 
            moTa,
            hinhAnh,
            tienIch
        } = req.body;

        let finalIdKhuTro = idKhuTro;
        const idChu = req.nguoiDung ? req.nguoiDung.id : 1;

        // Neu nguoi dung tu nhap ten khu tro / toa nha
        if (tenKhuTro && tenKhuTro.trim()) {
            const tenKhuClean = tenKhuTro.trim();
            const [khuHienCo] = await ketNoi.query(
                'SELECT id FROM khu_tro WHERE id_chu_doanh_nghiep = ? AND ten_khu_tro = ? LIMIT 1',
                [idChu, tenKhuClean]
            );

            if (khuHienCo.length > 0) {
                finalIdKhuTro = khuHienCo[0].id;
                // Cap nhat lai dia chi neu chu tro chon dia chi moi
                if (tinhThanh && phuongXa) {
                    await ketNoi.query(
                        'UPDATE khu_tro SET tinh_thanh = ?, quan_huyen = ?, phuong_xa = ?, dia_chi_chi_tiet = ? WHERE id = ?',
                        [tinhThanh, quanHuyen || '', phuongXa, diaChiChiTiet || '', finalIdKhuTro]
                    );
                }
            } else {
                // Tinh toa do tuong doi de hien thi ban do Leaflet 2km
                let lat = 10.776889, lng = 106.700806;
                if (tinhThanh && tinhThanh.includes('Hà Nội')) { lat = 21.028511; lng = 105.854167; }
                else if (tinhThanh && tinhThanh.includes('Đà Nẵng')) { lat = 16.054407; lng = 108.202167; }
                else if (tinhThanh && tinhThanh.includes('Bình Dương')) { lat = 10.980456; lng = 106.651874; }
                else if (tinhThanh && tinhThanh.includes('Cần Thơ')) { lat = 10.045162; lng = 105.746857; }
                else if (tinhThanh && tinhThanh.includes('Hải Phòng')) { lat = 20.844912; lng = 106.688084; }

                const [taoKhuMoi] = await ketNoi.query(
                    `INSERT INTO khu_tro (id_chu_doanh_nghiep, ten_khu_tro, tinh_thanh, quan_huyen, phuong_xa, dia_chi_chi_tiet, toa_do_lat, toa_do_lng)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [idChu, tenKhuClean, tinhThanh || 'TP. Hồ Chí Minh', quanHuyen || '', phuongXa || '', diaChiChiTiet || '', lat, lng]
                );
                finalIdKhuTro = taoKhuMoi.insertId;
            }
        }

        if (!finalIdKhuTro) {
            // Fallback lay khu tro dau tien cua chu tro neu co
            const [khuMacDinh] = await ketNoi.query('SELECT id FROM khu_tro WHERE id_chu_doanh_nghiep = ? LIMIT 1', [idChu]);
            finalIdKhuTro = khuMacDinh.length > 0 ? khuMacDinh[0].id : 1;
        }

        const hinhAnhDb = Array.isArray(hinhAnh) ? JSON.stringify(hinhAnh) : (hinhAnh || null);
        const tienIchDb = Array.isArray(tienIch) ? JSON.stringify(tienIch) : (tienIch || null);

        const [ketQua] = await ketNoi.query(
            `INSERT INTO phong_tro (id_khu_tro, ma_phong, tang, gia_thue, tien_coc, dien_tich, don_gia_dien, don_gia_nuoc, phi_dich_vu, mo_ta, hinh_anh, tien_ich)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalIdKhuTro, maPhong, tang || 1, giaThue, tienCoc || giaThue, dienTich, donGiaDien || 3500, donGiaNuoc || 20000, phiDichVu || 100000, moTa || '', hinhAnhDb, tienIchDb]
        );

        const idPhongMoi = ketQua.insertId;

        // Tu dong dong bo danh sach vat dung/thiet bi vat ly da tich vao bang thiet_bi
        const dsTienIchArray = Array.isArray(tienIch) ? tienIch : (typeof tienIch === 'string' ? tienIch.split(',') : []);
        const BANG_MAU_THIET_BI = [
            { tuKhoa: ['máy lạnh', 'điều hòa'], ten: 'Máy lạnh / Điều hòa Inverter', giaTri: 6500000 },
            { tuKhoa: ['tủ lạnh'], ten: 'Tủ lạnh 2 cánh', giaTri: 4500000 },
            { tuKhoa: ['máy giặt'], ten: 'Máy giặt cửa trên', giaTri: 4200000 },
            { tuKhoa: ['nóng lạnh', 'bình nóng'], ten: 'Bình nóng lạnh 20L', giaTri: 2500000 },
            { tuKhoa: ['giường'], ten: 'Giường gỗ + Nệm cao cấp', giaTri: 3000000 },
            { tuKhoa: ['tủ quần áo'], ten: 'Tủ quần áo 2 buồng', giaTri: 2200000 },
            { tuKhoa: ['kệ bếp', 'bếp'], ten: 'Kệ bếp & Bếp từ', giaTri: 1800000 },
            { tuKhoa: ['bàn ghế'], ten: 'Bàn ghế làm việc', giaTri: 1200000 },
            { tuKhoa: ['khóa', 'vân tay'], ten: 'Khóa cửa vân tay thông minh', giaTri: 2000000 },
            { tuKhoa: ['tivi'], ten: 'Tivi thông minh', giaTri: 5000000 },
            { tuKhoa: ['quạt'], ten: 'Quạt treo tường', giaTri: 600000 },
            { tuKhoa: ['lò vi sóng'], ten: 'Lò vi sóng', giaTri: 1500000 }
        ];

        const ngayHienTai = new Date();
        for (const ti of dsTienIchArray) {
            const tiClean = String(ti).trim().toLowerCase();
            const timDuoc = BANG_MAU_THIET_BI.find(item => item.tuKhoa.some(kw => tiClean.includes(kw)));
            if (timDuoc) {
                await ketNoi.query(
                    'INSERT INTO thiet_bi (id_phong, ten_thiet_bi, gia_tri, ngay_lap_dat) VALUES (?, ?, ?, ?)',
                    [idPhongMoi, timDuoc.ten, timDuoc.giaTri, ngayHienTai]
                );
            }
        }

        return phanHoiThanhCong(res, 'Thêm phòng trọ mới thành công', { id: idPhongMoi, idKhuTro: finalIdKhuTro });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi thêm phòng', loi.message, 500);
    }
}

async function capNhatPhong(req, res) {
    try {
        const { id } = req.params;
        const { maPhong, tang, giaThue, tienCoc, dienTich, donGiaDien, donGiaNuoc, phiDichVu, trangThai, moTa, hinhAnh, tienIch } = req.body;
        const hinhAnhDb = Array.isArray(hinhAnh) ? JSON.stringify(hinhAnh) : (hinhAnh !== undefined ? hinhAnh : null);
        const tienIchDb = Array.isArray(tienIch) ? JSON.stringify(tienIch) : (tienIch !== undefined ? tienIch : null);

        await ketNoi.query(
            `UPDATE phong_tro SET 
            ma_phong = COALESCE(?, ma_phong),
            tang = COALESCE(?, tang),
            gia_thue = COALESCE(?, gia_thue),
            tien_coc = COALESCE(?, tien_coc),
            dien_tich = COALESCE(?, dien_tich),
            don_gia_dien = COALESCE(?, don_gia_dien),
            don_gia_nuoc = COALESCE(?, don_gia_nuoc),
            phi_dich_vu = COALESCE(?, phi_dich_vu),
            trang_thai = COALESCE(?, trang_thai),
            mo_ta = COALESCE(?, mo_ta),
            hinh_anh = COALESCE(?, hinh_anh),
            tien_ich = COALESCE(?, tien_ich)
            WHERE id = ?`,
            [maPhong, tang, giaThue, tienCoc, dienTich, donGiaDien, donGiaNuoc, phiDichVu, trangThai, moTa, hinhAnhDb, tienIchDb, id]
        );
        return phanHoiThanhCong(res, 'Cập nhật phòng thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi cập nhật phòng', loi.message, 500);
    }
}

async function xoaPhong(req, res) {
    try {
        const { id } = req.params;
        await ketNoi.query('DELETE FROM phong_tro WHERE id = ?', [id]);
        return phanHoiThanhCong(res, 'Xóa phòng thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xóa phòng', loi.message, 500);
    }
}

// SỔ TAY THIẾT BỊ VÀ BẢO TRÌ
async function layThietBiPhong(req, res) {
    try {
        const { idPhong } = req.params;
        const [thietBi] = await ketNoi.query('SELECT * FROM thiet_bi WHERE id_phong = ?', [idPhong]);

        // Kiem tra ty le chi phi sua chua / gia tri thiet bi >= 60%
        const danhSach = thietBi.map(item => {
            const tyLeSua = Number(item.gia_tri) > 0 ? (Number(item.chi_phi_sua_luy_ke) / Number(item.gia_tri)) : 0;
            const deXuatMuaMoi = tyLeSua >= 0.6;
            return {
                ...item,
                tyLeChiPhiSuaChua: (tyLeSua * 100).toFixed(1),
                canhBaoDeXuatMuaMoi: deXuatMuaMoi
            };
        });

        return phanHoiThanhCong(res, 'Lấy danh sách thiết bị thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách thiết bị', loi.message, 500);
    }
}

async function themThietBi(req, res) {
    try {
        const { idPhong, tenThietBi, giaTri, ngayLapDat } = req.body;
        const [kq] = await ketNoi.query(
            'INSERT INTO thiet_bi (id_phong, ten_thiet_bi, gia_tri, ngay_lap_dat) VALUES (?, ?, ?, ?)',
            [idPhong, tenThietBi, giaTri, ngayLapDat || new Date()]
        );
        return phanHoiThanhCong(res, 'Thêm thiết bị thành công', { id: kq.insertId });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi thêm thiết bị', loi.message, 500);
    }
}

async function ghiBaoTriThietBi(req, res) {
    try {
        const { idThietBi, chiPhi, noiDung, ngayBaoTri } = req.body;
        // Luu lich su
        await ketNoi.query(
            'INSERT INTO lich_su_bao_tri (id_thiet_bi, chi_phi, noi_dung, ngay_bao_tri) VALUES (?, ?, ?, ?)',
            [idThietBi, chiPhi, noiDung, ngayBaoTri || new Date()]
        );

        // Cap nhat luy ke
        await ketNoi.query(
            'UPDATE thiet_bi SET chi_phi_sua_luy_ke = chi_phi_sua_luy_ke + ? WHERE id = ?',
            [chiPhi, idThietBi]
        );

        // Kiem tra ty le de doi trang thai
        const [tb] = await ketNoi.query('SELECT gia_tri, chi_phi_sua_luy_ke FROM thiet_bi WHERE id = ?', [idThietBi]);
        if (tb.length > 0) {
            const { gia_tri, chi_phi_sua_luy_ke } = tb[0];
            if (Number(gia_tri) > 0 && (Number(chi_phi_sua_luy_ke) / Number(gia_tri) >= 0.6)) {
                await ketNoi.query('UPDATE thiet_bi SET trang_thai = "de_xuat_mua_moi" WHERE id = ?', [idThietBi]);
            }
        }

        return phanHoiThanhCong(res, 'Ghi nhận bảo trì thiết bị thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi ghi nhận bảo trì', loi.message, 500);
    }
}

async function layTatCaThietBi(req, res) {
    try {
        let cauTruyVan = `
            SELECT tb.*, 
                   p.ma_phong, p.tang, p.gia_thue, p.trang_thai AS trang_thai_phong,
                   kt.id AS id_khu_tro, kt.ten_khu_tro, kt.tinh_thanh, kt.quan_huyen
            FROM thiet_bi tb
            JOIN phong_tro p ON tb.id_phong = p.id
            JOIN khu_tro kt ON p.id_khu_tro = kt.id
            WHERE 1=1
        `;
        const thamSo = [];
        if (req.danhSachKhuTroDuocGiao && req.danhSachKhuTroDuocGiao.length > 0) {
            cauTruyVan += ` AND p.id_khu_tro IN (${req.danhSachKhuTroDuocGiao.map(() => '?').join(',')})`;
            thamSo.push(...req.danhSachKhuTroDuocGiao);
        } else if (req.nguoiDung.vai_tro === 'chu_doanh_nghiep') {
            cauTruyVan += ' AND kt.id_chu_doanh_nghiep = ?';
            thamSo.push(req.nguoiDung.id);
        }

        cauTruyVan += ' ORDER BY kt.id ASC, p.tang ASC, p.ma_phong ASC, tb.id DESC';
        const [danhSach] = await ketNoi.query(cauTruyVan, thamSo);

        const danhSachBoSung = danhSach.map(item => {
            const tyLeSua = Number(item.gia_tri) > 0 ? (Number(item.chi_phi_sua_luy_ke) / Number(item.gia_tri)) : 0;
            const deXuatMuaMoi = tyLeSua >= 0.6 || item.trang_thai === 'de_xuat_mua_moi';
            return {
                ...item,
                tyLeChiPhiSuaChua: (tyLeSua * 100).toFixed(1),
                canhBaoDeXuatMuaMoi: deXuatMuaMoi
            };
        });

        return phanHoiThanhCong(res, 'Lấy toàn bộ thiết bị thành công', danhSachBoSung);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách thiết bị doanh nghiệp', loi.message, 500);
    }
}

async function xoaThietBi(req, res) {
    try {
        const { id } = req.params;
        await ketNoi.query('DELETE FROM thiet_bi WHERE id = ?', [id]);
        return phanHoiThanhCong(res, 'Xóa thiết bị thành công');
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xóa thiết bị', loi.message, 500);
    }
}

module.exports = {
    layDanhSachPhong,
    themPhong,
    capNhatPhong,
    xoaPhong,
    layThietBiPhong,
    themThietBi,
    ghiBaoTriThietBi,
    layTatCaThietBi,
    xoaThietBi
};
