const ketNoi = require('../cau_hinh/co_so_du_lieu');
const { phanHoiThanhCong, phanHoiThatBai } = require('../tien_ich/phan_hoi_api');
const { ghiNhatKy } = require('../trung_gian/nhat_ky_thao_tac');

// 1. QUAN LY DINH DANH & TAI KHOAN
async function layDanhSachNguoiDung(req, res) {
    try {
        const { vaiTro, trangThai, tuKhoa } = req.query;
        let cauTruyVan = 'SELECT id, ho_ten, email, so_dien_thoai, vai_tro, trang_thai, tao_luc FROM nguoi_dung WHERE 1=1';
        const thamSo = [];

        if (vaiTro) {
            cauTruyVan += ' AND vai_tro = ?';
            thamSo.push(vaiTro);
        }
        if (trangThai) {
            cauTruyVan += ' AND trang_thai = ?';
            thamSo.push(trangThai);
        }
        if (tuKhoa) {
            cauTruyVan += ' AND (ho_ten LIKE ? OR email LIKE ? OR so_dien_thoai LIKE ?)';
            thamSo.push(`%${tuKhoa}%`, `%${tuKhoa}%`, `%${tuKhoa}%`);
        }

        cauTruyVan += ' ORDER BY id DESC';
        const [danhSach] = await ketNoi.query(cauTruyVan, thamSo);
        return phanHoiThanhCong(res, 'Lấy danh sách người dùng thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách người dùng', loi.message, 500);
    }
}

async function capNhatTrangThaiNguoiDung(req, res) {
    try {
        const { idNguoiDung, trangThaiMoi, lyDo } = req.body;
        if (!['hoat_dong', 'bi_khoa', 'bi_cam'].includes(trangThaiMoi)) {
            return phanHoiThatBai(res, 'Trạng thái không hợp lệ');
        }

        await ketNoi.query('UPDATE nguoi_dung SET trang_thai = ? WHERE id = ?', [trangThaiMoi, idNguoiDung]);

        await ghiNhatKy(req.nguoiDung.id, `Đổi trạng thái người dùng thành: ${trangThaiMoi}`, 'nguoi_dung', idNguoiDung, null, { trangThaiMoi, lyDo });

        return phanHoiThanhCong(res, `Đã cập nhật trạng thái tài khoản thành: ${trangThaiMoi}`);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi cập nhật trạng thái', loi.message, 500);
    }
}

// 2. XAC THUC KYC
async function layDanhSachKYC(req, res) {
    try {
        const [danhSach] = await ketNoi.query(`
            SELECT k.*, u.ho_ten, u.email, u.so_dien_thoai 
            FROM ho_so_kyc k 
            JOIN nguoi_dung u ON k.id_nguoi_dung = u.id 
            ORDER BY k.id DESC
        `);
        return phanHoiThanhCong(res, 'Lấy danh sách KYC thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách KYC', loi.message, 500);
    }
}

async function pheDuyetKYC(req, res) {
    try {
        const { idKYC, trangThai, lyDoTuChoi } = req.body;
        const [kyc] = await ketNoi.query('SELECT * FROM ho_so_kyc WHERE id = ?', [idKYC]);
        if (kyc.length === 0) return phanHoiThatBai(res, 'Không tìm thấy hồ sơ KYC');

        const hoSo = kyc[0];
        const trangThaiDuyet = trangThai === 'da_duyet' ? 'da_duyet' : 'tu_choi';

        await ketNoi.query(
            'UPDATE ho_so_kyc SET trang_thai = ?, ly_do_tu_choi = ?, nguoi_duyet_id = ?, ngay_duyet = NOW() WHERE id = ?',
            [trangThaiDuyet, lyDoTuChoi || null, req.nguoiDung.id, idKYC]
        );

        if (trangThaiDuyet === 'da_duyet') {
            await ketNoi.query('UPDATE nguoi_dung SET trang_thai = "hoat_dong" WHERE id = ?', [hoSo.id_nguoi_dung]);
        }

        await ghiNhatKy(req.nguoiDung.id, `Xử lý duyệt KYC: ${trangThaiDuyet}`, 'ho_so_kyc', idKYC, hoSo.trang_thai, trangThaiDuyet);

        return phanHoiThanhCong(res, `Đã ${trangThaiDuyet === 'da_duyet' ? 'phê duyệt' : 'từ chối'} hồ sơ KYC`);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi duyệt hồ sơ KYC', loi.message, 500);
    }
}

// 3. KIEM DUYET NOI DUNG BAI DANG
async function layDanhSachKiemDuyetBaiDang(req, res) {
    try {
        const [danhSach] = await ketNoi.query(`
            SELECT b.*, p.ma_phong, u.ho_ten AS ten_chu_tro, u.so_dien_thoai AS sdt_chu_tro
            FROM bai_dang b
            JOIN phong_tro p ON b.id_phong = p.id
            JOIN nguoi_dung u ON b.id_chu = u.id
            ORDER BY b.so_luot_report DESC, b.id DESC
        `);
        return phanHoiThanhCong(res, 'Lấy danh sách bài đăng thành công', danhSach);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi lấy danh sách bài đăng', loi.message, 500);
    }
}

async function xuLyBaiDang(req, res) {
    try {
        const { idBaiDang, hanhDong, lyDo } = req.body;
        // hanhDong: 'duyet', 'go_bai', 'khoi_phuc'
        let trangThaiMoi = 'da_duyet';
        if (hanhDong === 'go_bai') trangThaiMoi = 'bi_go';
        if (hanhDong === 'khoi_phuc') trangThaiMoi = 'da_duyet';

        await ketNoi.query(
            'UPDATE bai_dang SET trang_thai = ?, ly_do_vi_pham = ? WHERE id = ?',
            [trangThaiMoi, lyDo || null, idBaiDang]
        );

        await ghiNhatKy(req.nguoiDung.id, `Xử lý bài đăng: ${hanhDong}`, 'bai_dang', idBaiDang, null, { trangThaiMoi, lyDo });

        return phanHoiThanhCong(res, `Đã xử lý bài đăng thành công (${trangThaiMoi})`);
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi xử lý bài đăng', loi.message, 500);
    }
}

// 4. DOI SOAT HOA HONG (10%)
async function layThongKeHoaHong(req, res) {
    try {
        const [danhSach] = await ketNoi.query(`
            SELECT h.*, hd.ma_hop_dong, u.ho_ten AS ten_chu_tro, u.so_dien_thoai, u.email
            FROM hoa_hong h
            JOIN hop_dong hd ON h.id_hop_dong = hd.id
            JOIN nguoi_dung u ON h.id_chu = u.id
            ORDER BY h.id DESC
        `);

        // Tinh tong hoa hong da thu va con no
        let daThu = 0;
        let conNo = 0;
        danhSach.forEach(item => {
            if (item.trang_thai === 'da_thu') daThu += Number(item.so_tien);
            else conNo += Number(item.so_tien);
        });

        return phanHoiThanhCong(res, 'Lấy đối soát hoa hồng thành công', {
            danhSach,
            tongDaThu: daThu,
            tongConNo: conNo,
            tyLeSan: 10 // 10%
        });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi đối soát hoa hồng', loi.message, 500);
    }
}

// 5. THONG KE NEN TANG
async function layThongKeNenTang(req, res) {
    try {
        const [tongUser] = await ketNoi.query('SELECT COUNT(*) AS tong FROM nguoi_dung');
        const [tongChuTro] = await ketNoi.query('SELECT COUNT(*) AS tong FROM nguoi_dung WHERE vai_tro = "chu_doanh_nghiep"');
        const [tongKhach] = await ketNoi.query('SELECT COUNT(*) AS tong FROM nguoi_dung WHERE vai_tro = "khach_thue"');
        const [tongHopDong] = await ketNoi.query('SELECT COUNT(*) AS tong FROM hop_dong WHERE trang_thai = "hieu_luc"');
        const [tongBaiDang] = await ketNoi.query('SELECT COUNT(*) AS tong FROM bai_dang WHERE trang_thai = "da_duyet"');
        const [doanhThuSan] = await ketNoi.query('SELECT SUM(so_tien) AS tong FROM hoa_hong WHERE trang_thai = "da_thu"');

        return phanHoiThanhCong(res, 'Lấy thống kê nền tảng thành công', {
            tongNguoiDung: tongUser[0].tong,
            tongChuTro: tongChuTro[0].tong,
            tongKhachThue: tongKhach[0].tong,
            tongHopDongThanhCong: tongHopDong[0].tong,
            tongBaiDang: tongBaiDang[0].tong,
            tongDoanhThuHoaHong: doanhThuSan[0].tong || 0
        });
    } catch (loi) {
        return phanHoiThatBai(res, 'Lỗi thống kê nền tảng', loi.message, 500);
    }
}

module.exports = {
    layDanhSachNguoiDung,
    capNhatTrangThaiNguoiDung,
    layDanhSachKYC,
    pheDuyetKYC,
    layDanhSachKiemDuyetBaiDang,
    xuLyBaiDang,
    layThongKeHoaHong,
    layThongKeNenTang
};
