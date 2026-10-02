USE `quan_ly_phong_tro`;

-- NGUOI DUNG MAU (Mat khau mac dinh tat ca: 123456)
INSERT INTO `nguoi_dung` (`id`, `ho_ten`, `email`, `so_dien_thoai`, `mat_khau`, `vai_tro`, `trang_thai`, `stk_ngan_hang`, `ten_ngan_hang`, `ten_chu_tai_khoan`) VALUES
(1, 'Ban Quan Tri Vien', 'admin@hethong.vn', '0900000001', '$2a$10$w0/rFgQujdsQG2ynoPyhX.DOVbCaMSNvl6V538Mq5NA/6MZr5miRO', 'admin', 'hoat_dong', NULL, NULL, NULL),
(2, 'Nguyen Van Chu (Chu Tro)', 'chutro@gmail.com', '0900000002', '$2a$10$w0/rFgQujdsQG2ynoPyhX.DOVbCaMSNvl6V538Mq5NA/6MZr5miRO', 'chu_doanh_nghiep', 'hoat_dong', '0123456789', 'Vietcombank', 'NGUYEN VAN CHU'),
(3, 'Tran Van Quan (Nhan Vien)', 'nhanvien@gmail.com', '0900000003', '$2a$10$w0/rFgQujdsQG2ynoPyhX.DOVbCaMSNvl6V538Mq5NA/6MZr5miRO', 'nhan_vien', 'hoat_dong', NULL, NULL, NULL),
(4, 'Le Thi Thu (Khach Thue)', 'khachthue@gmail.com', '0900000004', '$2a$10$w0/rFgQujdsQG2ynoPyhX.DOVbCaMSNvl6V538Mq5NA/6MZr5miRO', 'khach_thue', 'hoat_dong', NULL, NULL, NULL),
(5, 'Hoang Van Moi (Chu Tro Cho Duyet)', 'chutromoi@gmail.com', '0900000005', '$2a$10$w0/rFgQujdsQG2ynoPyhX.DOVbCaMSNvl6V538Mq5NA/6MZr5miRO', 'chu_doanh_nghiep', 'cho_duyet_kyc', '9876543210', 'MBBank', 'HOANG VAN MOI')
ON DUPLICATE KEY UPDATE `ho_ten`=VALUES(`ho_ten`);

-- HO SO KYC CHO DUYET
INSERT INTO `ho_so_kyc` (`id_nguoi_dung`, `cccd_so`, `anh_cccd_truoc`, `anh_cccd_sau`, `anh_giay_phep_kd`, `trang_thai`) VALUES
(5, '079200001234', '/tai_nguyen_dung_chung/hinh_anh/cccd_truoc_mau.jpg', '/tai_nguyen_dung_chung/hinh_anh/cccd_sau_mau.jpg', '/tai_nguyen_dung_chung/hinh_anh/gpkd_mau.jpg', 'cho_duyet')
ON DUPLICATE KEY UPDATE `cccd_so`=VALUES(`cccd_so`);

-- NHOM QUYEN CHO CHU TRO (ID=2)
INSERT INTO `nhom_quyen` (`id`, `id_chu_doanh_nghiep`, `ten_nhom`, `mo_ta`) VALUES
(1, 2, 'Quan Ly Toa Nha', 'Toan quyen quan ly phong tro, hoa don, khach thue va bao tri'),
(2, 2, 'Bao Ve Co So', 'Chi duoc phep ghi chi so dien nuoc va bao hong')
ON DUPLICATE KEY UPDATE `ten_nhom`=VALUES(`ten_nhom`);

-- PHAN QUYEN CHI TIET
INSERT INTO `phan_quyen_chi_tiet` (`id_nhom_quyen`, `ma_chuc_nang`, `quyen_xem`, `quyen_them`, `quyen_sua`, `quyen_xoa`) VALUES
(1, 'phong_tro', 1, 1, 1, 0),
(1, 'hop_dong', 1, 1, 1, 0),
(1, 'hoa_don', 1, 1, 1, 0),
(1, 'su_co', 1, 1, 1, 1),
(1, 'dien_nuoc', 1, 1, 1, 0),
(2, 'phong_tro', 1, 0, 0, 0),
(2, 'hop_dong', 0, 0, 0, 0),
(2, 'hoa_don', 1, 0, 0, 0),
(2, 'su_co', 1, 1, 1, 0),
(2, 'dien_nuoc', 1, 1, 1, 0)
ON DUPLICATE KEY UPDATE `quyen_xem`=VALUES(`quyen_xem`);

-- KHU TRO CUA CHU TRO (ID=2)
INSERT INTO `khu_tro` (`id`, `id_chu_doanh_nghiep`, `ten_khu_tro`, `tinh_thanh`, `quan_huyen`, `phuong_xa`, `dia_chi_chi_tiet`, `toa_do_lat`, `toa_do_lng`) VALUES
(1, 2, 'Khu Tro Xanh Sài Gòn', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Phường Tân Phong', '123 Đường Nguyễn Thị Thập', 10.732993, 106.708893),
(2, 2, 'Tòa Nhà An Cư Bình Thạnh', 'Thành phố Hồ Chí Minh', 'Quận Bình Thạnh', 'Phường 25', '456 Đường Điện Biên Phủ', 10.801234, 106.714567)
ON DUPLICATE KEY UPDATE `ten_khu_tro`=VALUES(`ten_khu_tro`);

-- PHAN CONG NHAN VIEN (ID=3) QUAN LY KHU TRO 1
INSERT INTO `nhan_vien_khu_vuc` (`id_nhan_vien`, `id_khu_tro`, `id_nhom_quyen`) VALUES
(3, 1, 1)
ON DUPLICATE KEY UPDATE `id_khu_tro`=VALUES(`id_khu_tro`);

-- PHONG TRO
INSERT INTO `phong_tro` (`id`, `id_khu_tro`, `ma_phong`, `tang`, `gia_thue`, `tien_coc`, `dien_tich`, `don_gia_dien`, `don_gia_nuoc`, `phi_dich_vu`, `trang_thai`, `mo_ta`) VALUES
(1, 1, 'P.101', 1, 3500000, 3500000, 25.0, 3500, 20000, 100000, 'da_thue', 'Phòng tầng trệt có gác lửng, ban công thoáng mát'),
(2, 1, 'P.102', 1, 3800000, 3800000, 28.0, 3500, 20000, 100000, 'con_trong', 'Phòng rộng full nội thất, máy lạnh mới'),
(3, 1, 'P.201', 2, 4000000, 4000000, 30.0, 3500, 20000, 100000, 'con_trong', 'Phòng tầng 2 có cửa sổ lớn đón nắng, view đẹp'),
(4, 2, 'P.B101', 1, 4500000, 4500000, 32.0, 3800, 22000, 120000, 'con_trong', 'Căn hộ mini trung tâm Bình Thạnh gần các trường đại học')
ON DUPLICATE KEY UPDATE `ma_phong`=VALUES(`ma_phong`);

-- THIET BI VA LICH SU BAO TRI
INSERT INTO `thiet_bi` (`id`, `id_phong`, `ten_thiet_bi`, `gia_tri`, `chi_phi_sua_luy_ke`, `trang_thai`, `ngay_lap_dat`) VALUES
(1, 1, 'Máy lạnh Daikin 1.5HP', 8000000, 1200000, 'hoat_dong_tot', '2023-01-15'),
(2, 1, 'Tủ lạnh Panasonic 180L', 5000000, 3200000, 'de_xuat_mua_moi', '2022-05-10')
ON DUPLICATE KEY UPDATE `ten_thiet_bi`=VALUES(`ten_thiet_bi`);

INSERT INTO `lich_su_bao_tri` (`id_thiet_bi`, `chi_phi`, `noi_dung`, `ngay_bao_tri`) VALUES
(2, 1200000, 'Thay block may lanh lan 1', '2023-08-10'),
(2, 2000000, 'Bao duong toan dien va thay gioang', '2024-02-15')
ON DUPLICATE KEY UPDATE `chi_phi`=VALUES(`chi_phi`);

-- BAI DANG CHO THUE
INSERT INTO `bai_dang` (`id`, `id_phong`, `id_chu`, `tieu_de`, `mo_ta`, `gia_thue`, `dien_tich`, `tien_ich`, `danh_sach_anh`, `trang_thai`, `cho_o_ghep`) VALUES
(1, 2, 2, 'Phòng trọ cao cấp Tân Phong Quận 7 - Full tiện nghi, giờ tự do', 'Phòng mới xây 100%, có máy lạnh, kệ bếp, WC riêng, giờ giấc tự do không chung chủ. Gần Lotte Mart và các trường ĐH Tôn Đức Thắng, RMIT.', 3800000, 28.0, 'Máy lạnh, Tủ lạnh, Gác lửng, WC riêng, Camera an ninh, Wifi tốc độ cao', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', 'da_duyet', 1),
(2, 3, 2, 'Phòng trọ ban công ngập tràn ánh sáng tại Nguyễn Thị Thập Q7', 'Phòng thoáng mát lầu 2, bảo vệ 24/7, có thang máy, bãi để xe rộng rãi.', 4000000, 30.0, 'Máy lạnh, Máy giặt chung, Thang máy, Khóa vân tay', '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', 'da_duyet', 1),
(3, 4, 2, 'Căn hộ dịch vụ Bình Thạnh gần Landmark 81', 'Phòng đẹp sang trọng, thuận tiện di chuyển sang Quận 1 trong 5 phút.', 4500000, 32.0, 'Full nội thất, Giờ tự do, Bếp riêng', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', 'cho_duyet', 0)
ON DUPLICATE KEY UPDATE `tieu_de`=VALUES(`tieu_de`);

-- HOP DONG THUE PHONG P.101 (KHACH THUE ID=4)
INSERT INTO `hop_dong` (`id`, `id_phong`, `id_chu`, `id_khach`, `ma_hop_dong`, `gia_thue`, `tien_coc`, `ngay_bat_dau`, `ngay_ket_thuc`, `dieu_khoan`, `trang_thai`) VALUES
(1, 1, 2, 4, 'HD-2026-P101', 3500000, 3500000, '2026-01-01', '2026-12-31', 'Thanh toán tiền phòng từ ngày 1 đến ngày 5 hàng tháng. Giữ gìn vệ sinh chung và trật tự sau 23h.', 'hieu_luc')
ON DUPLICATE KEY UPDATE `ma_hop_dong`=VALUES(`ma_hop_dong`);

-- NGUOI O GHEP TRONG HOP DONG 1
INSERT INTO `nguoi_o_ghep` (`id_hop_dong`, `ho_ten`, `so_dien_thoai`, `email`, `cccd`) VALUES
(1, 'Tran Kim Ngan', '0901234567', 'kimngan@gmail.com', '079201002233')
ON DUPLICATE KEY UPDATE `ho_ten`=VALUES(`ho_ten`);

-- HOA DON HANG THANG CHO P.101
INSERT INTO `hoa_don` (`id`, `id_hop_dong`, `id_phong`, `thang`, `nam`, `chi_so_dien_cu`, `chi_so_dien_moi`, `don_gia_dien`, `chi_so_nuoc_cu`, `chi_so_nuoc_moi`, `don_gia_nuoc`, `tien_phong`, `tien_dien`, `tien_nuoc`, `phi_dich_vu`, `tong_tien`, `canh_bao_bat_thuong`, `trang_thai`) VALUES
(1, 1, 1, 8, 2026, 120, 195, 3500, 45, 53, 20000, 3500000, 262500, 160000, 100000, 4022500, 0, 'da_thanh_toan'),
(2, 1, 1, 9, 2026, 195, 310, 3500, 53, 62, 20000, 3500000, 402500, 180000, 100000, 4182500, 0, 'chua_thanh_toan')
ON DUPLICATE KEY UPDATE `tong_tien`=VALUES(`tong_tien`);

-- CHIA BILL CAMPUCHIA CHO HOA DON 2 (4,182,500 / 2 = 2,091,250 VND moi nguoi)
INSERT INTO `chi_tiet_chia_bill` (`id_hoa_don`, `ho_ten`, `so_tien`, `trang_thai`) VALUES
(2, 'Le Thi Thu', 2091250, 'chua_thanh_toan'),
(2, 'Tran Kim Ngan', 2091250, 'chua_thanh_toan')
ON DUPLICATE KEY UPDATE `so_tien`=VALUES(`so_tien`);

-- SU CO BAO TRI
INSERT INTO `su_co` (`id`, `id_phong`, `id_khach`, `tieu_de`, `mo_ta`, `trang_thai`, `chi_phi_vat_tu`, `nguoi_chiu_phi`, `id_nhan_vien_xu_ly`) VALUES
(1, 1, 4, 'Bóng đèn nhà vệ sinh bị cháy', 'Bóng đèn tuýp led nhấp nháy rồi tắt hẳn tối qua.', 'dang_sua_chua', 85000, 'chu_tro', 3)
ON DUPLICATE KEY UPDATE `tieu_de`=VALUES(`tieu_de`);

-- CAU HOI FAQ CHATBOT
INSERT INTO `cau_hoi_faq` (`id_chu`, `cau_hoi`, `cau_tra_loi`, `tu_khoa`) VALUES
(2, 'Mật khẩu wifi của khu trọ là gì?', 'Mật khẩu wifi của tòa nhà là: khutroxanh2026 (viết liền không dấu).', 'wifi, mat khau wifi, pass wifi, mang'),
(2, 'Quy định giờ giấc của khu trọ như thế nào?', 'Khu trọ trang bị khóa vân tay ra vào 24/7, bạn có thể đi lại tự do nhưng vui lòng hạn chế gây tiếng ồn sau 23h đêm.', 'gio giac, khoa cua, may gio, gio dong cua'),
(2, 'Cách tính tiền điện nước hàng tháng như thế nào?', 'Điện được tính 3.500đ/kWh, Nước tính 20.000đ/m3, phí dịch vụ chung (wifi, rác, vệ sinh) là 100.000đ/phòng.', 'tien dien, tien nuoc, gia dien, gia nuoc, cach tinh bill'),
(2, 'Nội quy phòng cháy chữa cháy (PCCC)?', 'Không sử dụng bếp gas mini cũ, tắt các thiết bị điện sinh nhiệt khi ra khỏi phòng. Bình chữa cháy đặt tại hành lang mỗi tầng.', 'pccc, phong chay, binh chua chay, an toan')
ON DUPLICATE KEY UPDATE `cau_hoi`=VALUES(`cau_hoi`);

-- HOA HONG 10% THANG DAU CHO SAN
INSERT INTO `hoa_hong` (`id_hop_dong`, `id_chu`, `so_tien`, `ty_le`, `trang_thai`, `han_chot`) VALUES
(1, 2, 350000, 10.00, 'da_thu', '2026-01-15')
ON DUPLICATE KEY UPDATE `so_tien`=VALUES(`so_tien`);
