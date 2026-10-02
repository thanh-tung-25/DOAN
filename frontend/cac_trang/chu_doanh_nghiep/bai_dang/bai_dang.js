let toanBoDanhSachBaiDang = [];
let tabHienTai = 'tat_ca';

async function taiDanhSachBaiDang() {
    try {
        const res = await window.GoiAPI.get('/bai-dang');
        toanBoDanhSachBaiDang = res.du_lieu || [];
        capNhatSoLuongTabs();
        renderDanhSachBaiDang();
    } catch (loi) {
        window.hienThongBao('Lỗi tải bài đăng: ' + loi.message, 'loi');
    }
}

function capNhatSoLuongTabs() {
    const nguoiDungHienTai = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    const demTatCa = toanBoDanhSachBaiDang.length;
    const demCuaToi = toanBoDanhSachBaiDang.filter(b => nguoiDungHienTai && Number(b.id_chu) === Number(nguoiDungHienTai.id)).length;

    const elDemTatCa = document.getElementById('dem-tat-ca');
    const elDemCuaToi = document.getElementById('dem-cua-toi');
    if (elDemTatCa) elDemTatCa.textContent = demTatCa;
    if (elDemCuaToi) elDemCuaToi.textContent = demCuaToi;
}

function chuyenTabBaiDang(tab) {
    tabHienTai = tab;
    const tabTatCa = document.getElementById('tab-tat-ca');
    const tabCuaToi = document.getElementById('tab-cua-toi');
    if (tab === 'tat_ca') {
        if (tabTatCa) tabTatCa.classList.add('tab-active');
        if (tabCuaToi) tabCuaToi.classList.remove('tab-active');
    } else {
        if (tabTatCa) tabTatCa.classList.remove('tab-active');
        if (tabCuaToi) tabCuaToi.classList.add('tab-active');
    }
    renderDanhSachBaiDang();
}

function locDanhSachBaiDang() {
    renderDanhSachBaiDang();
}

function renderDanhSachBaiDang() {
    const container = document.getElementById('danh-sach-tin-dang');
    if (!container) return;

    const nguoiDungHienTai = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    const tuKhoa = (document.getElementById('tim-kiem-bai-dang') ? document.getElementById('tim-kiem-bai-dang').value : '').trim().toLowerCase();

    // 1. Lọc theo tab
    let danhSach = [...toanBoDanhSachBaiDang];
    if (tabHienTai === 'cua_toi') {
        danhSach = danhSach.filter(b => nguoiDungHienTai && Number(b.id_chu) === Number(nguoiDungHienTai.id));
    }

    // 2. Lọc theo từ khóa tìm kiếm
    if (tuKhoa) {
        danhSach = danhSach.filter(b => {
            const tieuDe = (b.tieu_de || '').toLowerCase();
            const diaChi = (b.dia_chi_chi_tiet || '').toLowerCase();
            const quan = (b.quan_huyen || '').toLowerCase();
            const tenChu = (b.ten_chu || '').toLowerCase();
            const sdtChu = (b.sdt_chu || '').toLowerCase();
            const maPhong = (b.ma_phong || '').toLowerCase();
            return tieuDe.includes(tuKhoa) || diaChi.includes(tuKhoa) || quan.includes(tuKhoa) ||
                   tenChu.includes(tuKhoa) || sdtChu.includes(tuKhoa) || maPhong.includes(tuKhoa);
        });
    }

    if (danhSach.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; color: #64748b; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
                <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">
                    ${tabHienTai === 'cua_toi' ? 'Bạn chưa có bài đăng nào' : 'Không tìm thấy bài đăng phù hợp'}
                </div>
                <div style="font-size: 13px;">
                    ${tabHienTai === 'cua_toi' 
                        ? 'Bấm nút "+ Tạo Tin Đăng Nhanh" phía trên để đăng tin phòng trọ của bạn lên sàn!' 
                        : 'Thử tìm kiếm với từ khóa khác hoặc chuyển sang tab khác.'}
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = danhSach.map(b => {
        let anh = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600';
        try {
            const arr = JSON.parse(b.danh_sach_anh);
            if (arr && arr.length > 0) anh = arr[0];
        } catch (e) {}

        const conPhong = b.trang_thai_phong === 'con_trong';
        const laBaiCuaMinh = nguoiDungHienTai && Number(b.id_chu) === Number(nguoiDungHienTai.id);
        const coQuyenXoa = nguoiDungHienTai && (laBaiCuaMinh || nguoiDungHienTai.vai_tro === 'admin');

        return `
            <div class="the-bai-dang">
                <div class="anh-bai-dang" style="background-image: url('${anh}');">
                    <span class="${conPhong ? 'nhan-phong-trong' : 'nhan-da-thue'}">
                        ${conPhong ? 'Còn phòng trống 🗝️' : 'Đã thuê hết 🔒'}
                    </span>
                </div>
                <div class="noi-dung-the-tin">
                    <div>
                        <h3 class="tieu-de-tin" title="${b.tieu_de}">${b.tieu_de}</h3>
                        <div class="dia-chi-tin" title="${b.dia_chi_chi_tiet}, ${b.quan_huyen} (Phòng: ${b.ma_phong})">📍 ${b.dia_chi_chi_tiet}, ${b.quan_huyen} (Phòng: ${b.ma_phong})</div>
                        <div class="gia-va-dien-tich">
                            <strong>${window.DinhDang.tienVND(b.gia_thue)}/tháng</strong>
                            <span>📐 ${b.dien_tich} m²</span>
                        </div>

                        <!-- KHỐI THÔNG TIN NGƯỜI ĐĂNG & LIÊN HỆ -->
                        <div class="khoi-tac-gia-bai-dang">
                            <div class="hang-tac-gia">
                                <div class="ten-nguoi-dang-hop">
                                    <div class="avatar-nho-chu">👤</div>
                                    <span>${b.ten_chu || 'Chủ trọ'}</span>
                                </div>
                                ${laBaiCuaMinh 
                                    ? '<span class="nhan-cua-ban">⭐ Bài của bạn</span>' 
                                    : '<span class="nhan-chu-khac">Chủ trọ khác</span>'}
                            </div>
                            <div class="hang-tac-gia" style="margin-top:2px;">
                                <a href="tel:${b.sdt_chu || ''}" class="lien-he-sdt-link" title="Bấm để gọi điện cho người đăng bài">
                                    📞 ${b.sdt_chu ? b.sdt_chu : 'Chưa có SĐT'}
                                </a>
                                ${b.email_chu ? `<span style="font-size:11px; color:#64748b;" title="Email liên hệ">✉️ ${b.email_chu}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; border-top:1px solid #f1f5f9; padding-top:10px;">
                        <span style="font-size:12px; color:#10b981;">${b.cho_o_ghep ? '🤝 Cho ở ghép' : '🚫 Ở riêng'}</span>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <a href="/cac_trang/cong_khai/chi_tiet_phong/chi_tiet_phong.html?id=${b.id}" class="nut-phu" style="font-size:12px; text-decoration:none;">Xem tin</a>
                            ${coQuyenXoa ? `
                                <button onclick="xoaTinDang(${b.id})" class="nut-nguy-hiem" style="font-size:12px; padding:5px 10px; border-radius:6px; cursor:pointer;" title="Chỉ người đăng bài mới có quyền xóa bài này">
                                    🗑️ Xóa
                                </button>
                            ` : `
                                <a href="tel:${b.sdt_chu || ''}" class="nut-phu" style="font-size:12px; text-decoration:none; color:#059669; border-color:#10b981;" title="Liên hệ người đăng">
                                    📞 Gọi
                                </a>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

let danhSachTepAnhTinDaChon = [];

function khoiTaoKeoThaAnhTin() {
    const vungKeoTha = document.getElementById('vung-keo-tha-anh-tin');
    if (!vungKeoTha) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        vungKeoTha.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            vungKeoTha.classList.add('keo-tha-hover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        vungKeoTha.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            vungKeoTha.classList.remove('keo-tha-hover');
        }, false);
    });

    vungKeoTha.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        xuLyThemTepAnhTin(files);
    }, false);
}

function xuLyChonTepAnhTin(e) {
    const files = e.target.files;
    xuLyThemTepAnhTin(files);
}

function xuLyThemTepAnhTin(files) {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            danhSachTepAnhTinDaChon.push(file);
        }
    }
    capNhatGiaoDienXemTruocAnhTin();
}

function xoaAnhTinDaChon(index) {
    danhSachTepAnhTinDaChon.splice(index, 1);
    capNhatGiaoDienXemTruocAnhTin();
}

function capNhatGiaoDienXemTruocAnhTin() {
    const container = document.getElementById('tin-danh-sach-xem-truoc-anh');
    const nhanSoLuong = document.getElementById('tin-so-luong-anh');
    if (!container) return;

    if (danhSachTepAnhTinDaChon.length === 0) {
        container.innerHTML = '';
        if (nhanSoLuong) nhanSoLuong.textContent = 'Chưa chọn ảnh';
        return;
    }

    if (nhanSoLuong) {
        nhanSoLuong.textContent = `Đã chọn ${danhSachTepAnhTinDaChon.length} file ảnh`;
    }

    container.innerHTML = danhSachTepAnhTinDaChon.map((file, idx) => {
        const urlBlob = URL.createObjectURL(file);
        return `
            <div class="the-xem-truoc-anh" title="${file.name}">
                <img src="${urlBlob}" alt="${file.name}">
                <button type="button" class="nut-xoa-anh" onclick="xoaAnhTinDaChon(${idx})">✕</button>
            </div>
        `;
    }).join('');
}

async function moModalDangTin() {
    document.getElementById('modal-dang-tin').style.display = 'flex';
    danhSachTepAnhTinDaChon = [];
    capNhatGiaoDienXemTruocAnhTin();
    khoiTaoKeoThaAnhTin();

    try {
        const res = await window.GoiAPI.get('/phong-tro');
        const dsPhong = res.du_lieu || [];
        const sel = document.getElementById('chon-phong-dang');
        if (sel) {
            sel.innerHTML = dsPhong.map(p => `
                <option value="${p.id}">${p.ma_phong} - ${p.ten_khu_tro} (${window.DinhDang.tienVND(p.gia_thue)} - ${p.dien_tich}m²)</option>
            `).join('');

            sel.onchange = function() {
                const phongDuocChon = dsPhong.find(p => String(p.id) === String(this.value));
                if (phongDuocChon && phongDuocChon.tien_ich) {
                    try {
                        const ti = JSON.parse(phongDuocChon.tien_ich);
                        if (Array.isArray(ti)) {
                            document.getElementById('tin-tien-ich').value = ti.join(', ');
                        }
                    } catch(e) {
                        document.getElementById('tin-tien-ich').value = phongDuocChon.tien_ich;
                    }
                }
            };
            sel.dispatchEvent(new Event('change'));
        }
    } catch (e) {
        console.error(e);
    }
}

function dongModalDangTin() {
    document.getElementById('modal-dang-tin').style.display = 'none';
    const form = document.getElementById('form-dang-tin');
    if (form) form.reset();
    danhSachTepAnhTinDaChon = [];
    capNhatGiaoDienXemTruocAnhTin();
    const inpTep = document.getElementById('tin-tep-anh');
    if (inpTep) inpTep.value = '';
}

async function xuLyDangTin(e) {
    e.preventDefault();
    const idPhong = document.getElementById('chon-phong-dang').value;
    const tieuDe = document.getElementById('tin-tieu-de').value.trim();
    const moTa = document.getElementById('tin-mo-ta').value.trim();
    const tienIch = document.getElementById('tin-tien-ich').value.trim();
    const choOGhep = document.getElementById('tin-cho-o-ghep').checked ? 1 : 0;
    const giaThue = document.getElementById('tin-gia-thue') ? document.getElementById('tin-gia-thue').value.trim() : '';
    const dienTich = document.getElementById('tin-dien-tich') ? document.getElementById('tin-dien-tich').value.trim() : '';

    let danhSachAnh = [];

    // Tải file ảnh lên backend nếu có file được chọn
    if (danhSachTepAnhTinDaChon.length > 0) {
        window.hienThongBao(`Đang tải lên ${danhSachTepAnhTinDaChon.length} file ảnh từ máy...`, 'thong_tin');
        try {
            const formData = new FormData();
            danhSachTepAnhTinDaChon.forEach(file => {
                formData.append('cac_anh', file);
            });

            const token = window.LuuTru ? window.LuuTru.layToken() : '';
            const resUpload = await fetch('http://localhost:5000/api/v1/tai-len/nhieu-anh', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });
            const kqUpload = await resUpload.json();
            if (kqUpload.thanh_cong && kqUpload.du_lieu && kqUpload.du_lieu.danh_sach) {
                danhSachAnh = kqUpload.du_lieu.danh_sach;
            }
        } catch (errUpload) {
            console.error('Lỗi khi tải ảnh bài đăng:', errUpload);
        }
    }

    if (danhSachAnh.length === 0) {
        danhSachAnh = ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"];
    }

    try {
        await window.GoiAPI.post('/bai-dang/tao-tu-phong', {
            idPhong,
            tieuDe,
            moTa,
            tienIch,
            choOGhep,
            danhSachAnh,
            giaThue: giaThue ? Number(giaThue) : undefined,
            dienTich: dienTich ? Number(dienTich) : undefined
        });
        window.hienThongBao('Đăng bài cho thuê thành công với dữ liệu thật & ảnh file!', 'thanh_cong');
        dongModalDangTin();
        taiDanhSachBaiDang();
    } catch (loi) {
        window.hienThongBao('Lỗi đăng tin: ' + loi.message, 'loi');
    }
}

async function xoaTinDang(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này khỏi hệ thống?')) return;
    try {
        await window.GoiAPI.delete(`/bai-dang/${id}`);
        window.hienThongBao('Đã xóa bài đăng thành công!', 'thanh_cong');
        taiDanhSachBaiDang();
    } catch (loi) {
        window.hienThongBao('Lỗi xóa tin: ' + loi.message, 'loi');
    }
}

window.moModalDangTin = moModalDangTin;
window.dongModalDangTin = dongModalDangTin;
window.xuLyDangTin = xuLyDangTin;
window.xoaTinDang = xoaTinDang;
window.xuLyChonTepAnhTin = xuLyChonTepAnhTin;
window.xoaAnhTinDaChon = xoaAnhTinDaChon;
window.chuyenTabBaiDang = chuyenTabBaiDang;
window.locDanhSachBaiDang = locDanhSachBaiDang;

document.addEventListener('DOMContentLoaded', taiDanhSachBaiDang);
