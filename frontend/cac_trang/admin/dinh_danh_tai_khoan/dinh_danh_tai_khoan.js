let danhSachTatCaNguoiDung = [];

async function taiDanhSachNguoiDung() {
    try {
        const res = await window.GoiAPI.get('/quan-tri/nguoi-dung');
        danhSachTatCaNguoiDung = res.du_lieu || [];
        hienThiNguoiDung(danhSachTatCaNguoiDung);
    } catch (loi) {
        window.hienThongBao('Lỗi tải danh sách người dùng: ' + loi.message, 'loi');
    }
}

function hienThiNguoiDung(danhSach) {
    const tbody = document.getElementById('bang-ds-nguoi-dung');
    if (!tbody) return;

    if (danhSach.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Không có người dùng nào phù hợp</td></tr>';
        return;
    }

    const tenVaiTro = {
        admin: 'Quản trị viên',
        chu_doanh_nghiep: 'Chủ trọ',
        nhan_vien: 'Nhân viên',
        khach_thue: 'Khách thuê'
    };

    tbody.innerHTML = danhSach.map(u => `
        <tr>
            <td>#${u.id}</td>
            <td><strong>${u.ho_ten}</strong></td>
            <td>${u.email}</td>
            <td>${u.so_dien_thoai}</td>
            <td><span class="the-vai-tro vai-tro-${u.vai_tro}">${tenVaiTro[u.vai_tro] || u.vai_tro}</span></td>
            <td><span class="nhan-trang-thai trang-thai-${u.trang_thai}">${u.trang_thai}</span></td>
            <td>
                <div class="nhom-nut-hanh-dong">
                    ${u.trang_thai === 'hoat_dong' ? `
                        <button class="nut-phu" onclick="thayDoiTrangThai(${u.id}, 'bi_khoa')">Khóa</button>
                        <button class="nut-nguy-hiem" onclick="thayDoiTrangThai(${u.id}, 'bi_cam')">Cấm vĩnh viễn</button>
                    ` : `
                        <button class="nut-thanh-cong" onclick="thayDoiTrangThai(${u.id}, 'hoat_dong')">Kích hoạt lại</button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

function locNguoiDung() {
    const tuKhoa = document.getElementById('tu-khoa-tim').value.toLowerCase();
    const vaiTro = document.getElementById('loc-vai-tro').value;
    const trangThai = document.getElementById('loc-trang-thai').value;

    const loc = danhSachTatCaNguoiDung.filter(u => {
        const matchTuKhoa = !tuKhoa || u.ho_ten.toLowerCase().includes(tuKhoa) || u.email.toLowerCase().includes(tuKhoa) || u.so_dien_thoai.includes(tuKhoa);
        const matchVaiTro = !vaiTro || u.vai_tro === vaiTro;
        const matchTrangThai = !trangThai || u.trang_thai === trangThai;
        return matchTuKhoa && matchVaiTro && matchTrangThai;
    });

    hienThiNguoiDung(loc);
}

async function thayDoiTrangThai(idNguoiDung, trangThaiMoi) {
    const xacNhan = confirm(`Bạn có chắc muốn đổi trạng thái người dùng #${idNguoiDung} thành "${trangThaiMoi}" không?`);
    if (!xacNhan) return;

    try {
        await window.GoiAPI.put('/quan-tri/nguoi-dung/trang-thai', {
            idNguoiDung,
            trangThaiMoi,
            lyDo: 'Admin xử lý từ bảng điều khiển'
        });
        window.hienThongBao('Đã cập nhật trạng thái thành công!', 'thanh_cong');
        taiDanhSachNguoiDung();
    } catch (loi) {
        window.hienThongBao('Lỗi cập nhật trạng thái: ' + loi.message, 'loi');
    }
}

// XU LY TAB KYC
async function taiDanhSachKYC() {
    try {
        const res = await window.GoiAPI.get('/quan-tri/kyc');
        const dsk = res.du_lieu || [];
        const soCho = dsk.filter(k => k.trang_thai === 'cho_duyet').length;
        document.getElementById('so-kyc-cho').textContent = soCho;

        const tbody = document.getElementById('bang-ds-kyc');
        if (!tbody) return;

        if (dsk.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa có hồ sơ KYC nào</td></tr>';
            return;
        }

        tbody.innerHTML = dsk.map(k => `
            <tr>
                <td>
                    <strong>${k.ho_ten}</strong><br>
                    <small>${k.email} | ${k.so_dien_thoai}</small>
                </td>
                <td><strong>${k.cccd_so}</strong></td>
                <td>
                    <button class="nut-phu" onclick="moModalCCCD('${k.anh_cccd_truoc}', '${k.anh_cccd_sau}')">👁️ Xem ảnh CCCD</button>
                </td>
                <td><span class="nhan-trang-thai trang-thai-${k.trang_thai}">${k.trang_thai}</span></td>
                <td>
                    ${k.trang_thai === 'cho_duyet' ? `
                        <button class="nut-thanh-cong" onclick="duyetKYC(${k.id}, 'da_duyet')">✓ Phê duyệt</button>
                        <button class="nut-nguy-hiem" onclick="duyetKYC(${k.id}, 'tu_choi')">✕ Từ chối</button>
                    ` : `
                        <span>Đã xử lý</span>
                    `}
                </td>
            </tr>
        `).join('');
    } catch (loi) {
        console.error('Loi tai KYC:', loi);
    }
}

async function duyetKYC(idKYC, trangThai) {
    let lyDoTuChoi = '';
    if (trangThai === 'tu_choi') {
        lyDoTuChoi = prompt('Nhập lý do từ chối hồ sơ KYC:');
        if (!lyDoTuChoi) return;
    }

    try {
        await window.GoiAPI.post('/quan-tri/kyc/duyet', { idKYC, trangThai, lyDoTuChoi });
        window.hienThongBao('Đã xử lý hồ sơ KYC thành công!', 'thanh_cong');
        taiDanhSachKYC();
        taiDanhSachNguoiDung();
    } catch (loi) {
        window.hienThongBao('Lỗi phê duyệt: ' + loi.message, 'loi');
    }
}

function moModalCCCD(truoc, sau) {
    document.getElementById('img-cccd-truoc').src = truoc || 'https://via.placeholder.com/400x250?text=Mat+Truoc+CCCD';
    document.getElementById('img-cccd-sau').src = sau || 'https://via.placeholder.com/400x250?text=Mat+Sau+CCCD';
    document.getElementById('modal-xem-cccd').style.display = 'flex';
}

function dongModalCCCD() {
    document.getElementById('modal-xem-cccd').style.display = 'none';
}

function chuyenTab(tab) {
    document.getElementById('tab-nguoi-dung').className = tab === 'nguoi_dung' ? 'nut-tab kich-hoat' : 'nut-tab';
    document.getElementById('tab-kyc').className = tab === 'kyc' ? 'nut-tab kich-hoat' : 'nut-tab';

    document.getElementById('phan-nguoi-dung').style.display = tab === 'nguoi_dung' ? 'block' : 'none';
    document.getElementById('phan-kyc').style.display = tab === 'kyc' ? 'block' : 'none';
}

window.thayDoiTrangThai = thayDoiTrangThai;
window.locNguoiDung = locNguoiDung;
window.duyetKYC = duyetKYC;
window.moModalCCCD = moModalCCCD;
window.dongModalCCCD = dongModalCCCD;
window.chuyenTab = chuyenTab;

document.addEventListener('DOMContentLoaded', () => {
    taiDanhSachNguoiDung();
    taiDanhSachKYC();
});
