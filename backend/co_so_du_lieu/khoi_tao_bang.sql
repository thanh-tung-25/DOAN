-- ====================================================================
-- KHOI TAO CO SO DU LIEU: QUAN LY PHONG TRO
-- ====================================================================
CREATE DATABASE IF NOT EXISTS `quan_ly_phong_tro` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quan_ly_phong_tro`;

-- 1. BANG NGUOI DUNG
CREATE TABLE IF NOT EXISTS `nguoi_dung` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ho_ten` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `so_dien_thoai` VARCHAR(20) NOT NULL UNIQUE,
    `mat_khau` VARCHAR(255) NOT NULL,
    `vai_tro` ENUM('admin', 'chu_doanh_nghiep', 'nhan_vien', 'khach_thue') NOT NULL,
    `anh_dai_dien` VARCHAR(255) DEFAULT '/tai_nguyen_dung_chung/hinh_anh/avatar_mac_dinh.png',
    `trang_thai` ENUM('cho_duyet_kyc', 'hoat_dong', 'bi_khoa', 'bi_cam') DEFAULT 'hoat_dong',
    `stk_ngan_hang` VARCHAR(50) NULL,
    `ten_ngan_hang` VARCHAR(50) NULL,
    `ten_chu_tai_khoan` VARCHAR(100) NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BANG HO SO KYC (XAC THUC CHU TRO)
CREATE TABLE IF NOT EXISTS `ho_so_kyc` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_nguoi_dung` INT NOT NULL,
    `cccd_so` VARCHAR(20) NOT NULL,
    `anh_cccd_truoc` VARCHAR(255) NOT NULL,
    `anh_cccd_sau` VARCHAR(255) NOT NULL,
    `anh_giay_phep_kd` VARCHAR(255) NULL,
    `trang_thai` ENUM('cho_duyet', 'da_duyet', 'tu_choi') DEFAULT 'cho_duyet',
    `ly_do_tu_choi` TEXT NULL,
    `nguoi_duyet_id` INT NULL,
    `ngay_duyet` DATETIME NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_nguoi_dung`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BANG NHOM QUYEN (RBAC)
CREATE TABLE IF NOT EXISTS `nhom_quyen` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_chu_doanh_nghiep` INT NOT NULL,
    `ten_nhom` VARCHAR(100) NOT NULL,
    `mo_ta` VARCHAR(255) NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_chu_doanh_nghiep`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BANG PHAN QUYEN CHI TIET
CREATE TABLE IF NOT EXISTS `phan_quyen_chi_tiet` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_nhom_quyen` INT NOT NULL,
    `ma_chuc_nang` VARCHAR(50) NOT NULL, -- 'phong_tro', 'hop_dong', 'hoa_don', 'su_co', 'dien_nuoc'
    `quyen_xem` TINYINT(1) DEFAULT 1,
    `quyen_them` TINYINT(1) DEFAULT 0,
    `quyen_sua` TINYINT(1) DEFAULT 0,
    `quyen_xoa` TINYINT(1) DEFAULT 0,
    FOREIGN KEY (`id_nhom_quyen`) REFERENCES `nhom_quyen`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BANG KHU TRO / TOA NHA
CREATE TABLE IF NOT EXISTS `khu_tro` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_chu_doanh_nghiep` INT NOT NULL,
    `ten_khu_tro` VARCHAR(150) NOT NULL,
    `tinh_thanh` VARCHAR(100) NOT NULL,
    `quan_huyen` VARCHAR(100) NOT NULL,
    `phuong_xa` VARCHAR(100) NOT NULL,
    `dia_chi_chi_tiet` VARCHAR(255) NOT NULL,
    `toa_do_lat` DECIMAL(10, 8) NULL DEFAULT 10.776889,
    `toa_do_lng` DECIMAL(11, 8) NULL DEFAULT 106.700806,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_chu_doanh_nghiep`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BANG PHAN CONG NHAN VIEN QUAN LY KHU VUC
CREATE TABLE IF NOT EXISTS `nhan_vien_khu_vuc` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_nhan_vien` INT NOT NULL,
    `id_khu_tro` INT NOT NULL,
    `id_nhom_quyen` INT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_nhan_vien`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_khu_tro`) REFERENCES `khu_tro`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_nhom_quyen`) REFERENCES `nhom_quyen`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BANG PHONG TRO
CREATE TABLE IF NOT EXISTS `phong_tro` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_khu_tro` INT NOT NULL,
    `ma_phong` VARCHAR(50) NOT NULL,
    `tang` INT DEFAULT 1,
    `gia_thue` DECIMAL(12, 2) NOT NULL,
    `tien_coc` DECIMAL(12, 2) NOT NULL,
    `dien_tich` DECIMAL(6, 2) NOT NULL,
    `don_gia_dien` DECIMAL(10, 2) DEFAULT 3500,
    `don_gia_nuoc` DECIMAL(10, 2) DEFAULT 20000,
    `phi_dich_vu` DECIMAL(10, 2) DEFAULT 100000,
    `trang_thai` ENUM('con_trong', 'da_thue', 'dang_sua_chua') DEFAULT 'con_trong',
    `mo_ta` TEXT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_khu_tro`) REFERENCES `khu_tro`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BANG THIET BI TRONG PHONG
CREATE TABLE IF NOT EXISTS `thiet_bi` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_phong` INT NOT NULL,
    `ten_thiet_bi` VARCHAR(100) NOT NULL,
    `gia_tri` DECIMAL(12, 2) NOT NULL,
    `chi_phi_sua_luy_ke` DECIMAL(12, 2) DEFAULT 0,
    `trang_thai` ENUM('hoat_dong_tot', 'can_bao_duong', 'hong_hoc', 'de_xuat_mua_moi') DEFAULT 'hoat_dong_tot',
    `ngay_lap_dat` DATE NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BANG LICH SU BAO TRI THIET BI
CREATE TABLE IF NOT EXISTS `lich_su_bao_tri` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_thiet_bi` INT NOT NULL,
    `chi_phi` DECIMAL(12, 2) NOT NULL,
    `noi_dung` VARCHAR(255) NOT NULL,
    `ngay_bao_tri` DATE NOT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_thiet_bi`) REFERENCES `thiet_bi`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BANG BAI DANG CHO THUE
CREATE TABLE IF NOT EXISTS `bai_dang` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_phong` INT NOT NULL,
    `id_chu` INT NOT NULL,
    `tieu_de` VARCHAR(255) NOT NULL,
    `mo_ta` TEXT NOT NULL,
    `gia_thue` DECIMAL(12, 2) NOT NULL,
    `dien_tich` DECIMAL(6, 2) NOT NULL,
    `tien_ich` TEXT NULL, -- JSON string hoặc phân tách bằng dấu phẩy
    `danh_sach_anh` TEXT NULL, -- JSON string chứa các đường dẫn ảnh
    `trang_thai` ENUM('cho_duyet', 'da_duyet', 'bi_go', 'da_thue_het') DEFAULT 'cho_duyet',
    `cho_o_ghep` TINYINT(1) DEFAULT 1,
    `so_luot_report` INT DEFAULT 0,
    `ly_do_vi_pham` TEXT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_chu`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BANG HOP DONG
CREATE TABLE IF NOT EXISTS `hop_dong` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_phong` INT NOT NULL,
    `id_chu` INT NOT NULL,
    `id_khach` INT NOT NULL,
    `ma_hop_dong` VARCHAR(50) NOT NULL UNIQUE,
    `gia_thue` DECIMAL(12, 2) NOT NULL,
    `tien_coc` DECIMAL(12, 2) NOT NULL,
    `ngay_bat_dau` DATE NOT NULL,
    `ngay_ket_thuc` DATE NOT NULL,
    `dieu_khoan` TEXT NULL,
    `chu_ky_chu` MEDIUMTEXT NULL, -- Chu ky Canvas Base64
    `chu_ky_khach` MEDIUMTEXT NULL, -- Chu ky Canvas Base64
    `trang_thai` ENUM('cho_ky', 'hieu_luc', 'sap_het_han', 'het_han', 'da_thanh_ly') DEFAULT 'cho_ky',
    `file_pdf_hop_dong` VARCHAR(255) NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_chu`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_khach`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BANG NGUOI O GHEP
CREATE TABLE IF NOT EXISTS `nguoi_o_ghep` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_hop_dong` INT NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `so_dien_thoai` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `cccd` VARCHAR(20) NULL,
    FOREIGN KEY (`id_hop_dong`) REFERENCES `hop_dong`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BANG HOA DON HANG THANG
CREATE TABLE IF NOT EXISTS `hoa_don` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_hop_dong` INT NOT NULL,
    `id_phong` INT NOT NULL,
    `thang` INT NOT NULL,
    `nam` INT NOT NULL,
    `chi_so_dien_cu` INT NOT NULL,
    `chi_so_dien_moi` INT NOT NULL,
    `don_gia_dien` DECIMAL(10, 2) NOT NULL,
    `chi_so_nuoc_cu` INT NOT NULL,
    `chi_so_nuoc_moi` INT NOT NULL,
    `don_gia_nuoc` DECIMAL(10, 2) NOT NULL,
    `tien_phong` DECIMAL(12, 2) NOT NULL,
    `tien_dien` DECIMAL(12, 2) NOT NULL,
    `tien_nuoc` DECIMAL(12, 2) NOT NULL,
    `phi_dich_vu` DECIMAL(12, 2) NOT NULL,
    `tong_tien` DECIMAL(12, 2) NOT NULL,
    `canh_bao_bat_thuong` TINYINT(1) DEFAULT 0, -- 1 neu tang dot bien x3
    `trang_thai` ENUM('chua_thanh_toan', 'cho_xac_nhan', 'da_thanh_toan') DEFAULT 'chua_thanh_toan',
    `hinh_thuc_thanh_toan` ENUM('chuyen_khoan', 'tien_mat') NULL,
    `anh_bien_lai` VARCHAR(255) NULL,
    `id_nhan_vien_thu` INT NULL,
    `ngay_thanh_toan` DATETIME NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_hop_dong`) REFERENCES `hop_dong`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. BANG CHI TIET CHIA BILL (CAMPUCHIA)
CREATE TABLE IF NOT EXISTS `chi_tiet_chia_bill` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_hoa_don` INT NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `so_tien` DECIMAL(12, 2) NOT NULL,
    `trang_thai` ENUM('chua_thanh_toan', 'da_thanh_toan') DEFAULT 'chua_thanh_toan',
    `ma_vietqr` TEXT NULL,
    `ngay_thanh_toan` DATETIME NULL,
    FOREIGN KEY (`id_hoa_don`) REFERENCES `hoa_don`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. BANG SU CO & BAO TRI (TICKETING)
CREATE TABLE IF NOT EXISTS `su_co` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_phong` INT NOT NULL,
    `id_khach` INT NOT NULL,
    `tieu_de` VARCHAR(255) NOT NULL,
    `mo_ta` TEXT NOT NULL,
    `anh_dinh_kem` VARCHAR(255) NULL,
    `trang_thai` ENUM('moi_tiep_nhan', 'dang_sua_chua', 'da_hoan_thanh') DEFAULT 'moi_tiep_nhan',
    `chi_phi_vat_tu` DECIMAL(12, 2) DEFAULT 0,
    `nguoi_chiu_phi` ENUM('chu_tro', 'khach_thue') DEFAULT 'chu_tro',
    `id_nhan_vien_xu_ly` INT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_khach`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. BANG TIN NHAN
CREATE TABLE IF NOT EXISTS `tin_nhan` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_nguoi_gui` INT NOT NULL,
    `id_nguoi_nhan` INT NOT NULL,
    `noi_dung` TEXT NOT NULL,
    `hinh_anh` VARCHAR(255) NULL,
    `da_xem` TINYINT(1) DEFAULT 0,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_nguoi_gui`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_nguoi_nhan`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. BANG CAU HOI FAQ CHATBOT
CREATE TABLE IF NOT EXISTS `cau_hoi_faq` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_chu` INT NOT NULL,
    `cau_hoi` VARCHAR(255) NOT NULL,
    `cau_tra_loi` TEXT NOT NULL,
    `tu_khoa` VARCHAR(255) NOT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_chu`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. BANG HOA HONG NEN TANG (10% THANG DAU)
CREATE TABLE IF NOT EXISTS `hoa_hong` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_hop_dong` INT NOT NULL,
    `id_chu` INT NOT NULL,
    `so_tien` DECIMAL(12, 2) NOT NULL,
    `ty_le` DECIMAL(5, 2) DEFAULT 10.00,
    `trang_thai` ENUM('chua_thu', 'da_thu', 'qua_han') DEFAULT 'chua_thu',
    `han_chot` DATE NOT NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_hop_dong`) REFERENCES `hop_dong`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_chu`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. BANG CANH BAO SOS
CREATE TABLE IF NOT EXISTS `canh_bao_sos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_phong` INT NOT NULL,
    `id_khach` INT NOT NULL,
    `id_chu` INT NOT NULL,
    `noi_dung` VARCHAR(255) DEFAULT 'BÁO ĐỘNG KHẨN CẤP TỪ KHÁCH THUÊ',
    `trang_thai` ENUM('dang_phat', 'da_xu_ly') DEFAULT 'dang_phat',
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_phong`) REFERENCES `phong_tro`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_khach`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`id_chu`) REFERENCES `nguoi_dung`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. BANG NHAT KY HE THONG (AUDIT LOG)
CREATE TABLE IF NOT EXISTS `nhat_ky_he_thong` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `id_nguoi_dung` INT NULL,
    `hanh_dong` VARCHAR(100) NOT NULL,
    `bang_anh_huong` VARCHAR(50) NOT NULL,
    `id_ban_ghi` INT NULL,
    `gia_tri_cu` TEXT NULL,
    `gia_tri_moi` TEXT NULL,
    `dia_chi_ip` VARCHAR(50) NULL,
    `tao_luc` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_nguoi_dung`) REFERENCES `nguoi_dung`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
