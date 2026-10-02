// ====================================================================
// QUẢN LÝ PHÒNG TRỌ, PHÂN TẦNG & THIẾT BỊ DOANH NGHIỆP LỚN
// ====================================================================

let danhSachPhong = [];
let danhSachKhuTro = [];
let danhSachThietBi = [];
let idKhuTroHienTai = 'tat_ca';
let cheDoXemHienTai = 'matrix'; // 'matrix' | 'table' | 'assets'
let idPhongDangChon = null;
let mapInstance = null;
let danhSachTepAnhDaChon = [];

// 1. TẢI TOÀN BỘ DỮ LIỆU BAN ĐẦU
async function taiToanBoDuLieu() {
    try {
        await Promise.all([
            taiDanhSachKhuTro(),
            taiDanhSachPhong(),
            taiToanBoThietBi()
        ]);
        capNhatKPIDoanhNghiep();
        taoNutChonToaNha();
        locDuLieu();
    } catch (loi) {
        console.error('Lỗi tải dữ liệu hệ thống:', loi);
        if (window.hienThongBao) {
            window.hienThongBao('Lỗi kết nối máy chủ: ' + loi.message, 'loi');
        }
    }
}

async function taiDanhSachKhuTro() {
    try {
        const res = await window.GoiAPI.get('/chu-doanh-nghiep/khu-tro');
        danhSachKhuTro = res.du_lieu || [];
        capNhatSelectToaNhaForm();
    } catch (e) {
        console.error('Lỗi tải danh sách khu trọ/tòa nhà:', e);
    }
}

async function taiDanhSachPhong() {
    try {
        const res = await window.GoiAPI.get('/phong-tro');
        danhSachPhong = res.du_lieu || [];
    } catch (e) {
        console.error('Lỗi tải danh sách phòng:', e);
    }
}

async function taiToanBoThietBi() {
    try {
        const res = await window.GoiAPI.get('/phong-tro/tat-ca-thiet-bi');
        danhSachThietBi = res.du_lieu || [];
    } catch (e) {
        console.error('Lỗi tải danh sách thiết bị doanh nghiệp:', e);
    }
}

// 2. TÍNH TOÁN & CẬP NHẬT KPI DOANH NGHIỆP
function capNhatKPIDoanhNghiep() {
    const elTongToa = document.getElementById('kpi-tong-toa');
    const elSubToa = document.getElementById('kpi-sub-toa');
    const elTongTang = document.getElementById('kpi-tong-tang');
    const elSubTang = document.getElementById('kpi-sub-tang');
    const elTongPhong = document.getElementById('kpi-tong-phong');
    const elPhongTrong = document.getElementById('kpi-phong-trong');
    const elPhongThue = document.getElementById('kpi-phong-thue');
    const elPhongSua = document.getElementById('kpi-phong-sua');
    const elTongTB = document.getElementById('kpi-tong-thiet-bi');
    const elCanhBaoTB = document.getElementById('kpi-canh-bao-tb');

    // 1. Tòa nhà
    if (elTongToa) elTongToa.textContent = `${danhSachKhuTro.length} Tòa Nhà`;
    if (elSubToa) elSubToa.textContent = `Đang vận hành toàn hệ thống`;

    // 2. Tầng
    const tapHopTang = new Set(danhSachPhong.map(p => `${p.id_khu_tro}-${p.tang || 1}`));
    if (elTongTang) elTongTang.textContent = `${tapHopTang.size} Tầng Lầu`;
    if (elSubTang) elSubTang.textContent = `Mặt bằng quy mô tiêu chuẩn`;

    // 3. Phòng
    const tongPhong = danhSachPhong.length;
    const pTrong = danhSachPhong.filter(p => p.trang_thai === 'con_trong').length;
    const pThue = danhSachPhong.filter(p => p.trang_thai === 'da_thue').length;
    const pSua = danhSachPhong.filter(p => p.trang_thai === 'dang_sua_chua').length;
    const tyLeLapDay = tongPhong > 0 ? Math.round((pThue / tongPhong) * 100) : 0;

    if (elTongPhong) elTongPhong.textContent = `${tongPhong} Phòng (${tyLeLapDay}% lấp đầy)`;
    if (elPhongTrong) elPhongTrong.textContent = `${pTrong} Trống`;
    if (elPhongThue) elPhongThue.textContent = `${pThue} Đã thuê`;
    if (elPhongSua) elPhongSua.textContent = `${pSua} Bảo trì`;

    // 4. Thiết bị & Cảnh báo khấu hao >60%
    const tongTB = danhSachThietBi.length;
    const tbCanhBao = danhSachThietBi.filter(tb => tb.canhBaoDeXuatMuaMoi).length;
    let tongGiaTriTB = danhSachThietBi.reduce((sum, tb) => sum + (Number(tb.gia_tri) || 0), 0);

    if (elTongTB) {
        elTongTB.textContent = `${tongTB} Thiết Bị (~${Math.round(tongGiaTriTB / 1000000)}Tr)`;
    }
    if (elCanhBaoTB) {
        if (tbCanhBao > 0) {
            elCanhBaoTB.innerHTML = `<span class="badge-mini badge-de-xuat">🚨 ${tbCanhBao} Cần mua mới (&gt;60%)</span>`;
        } else {
            elCanhBaoTB.innerHTML = `<span class="badge-mini badge-trong">✅ 100% Hoạt động tốt</span>`;
        }
    }
}

// 3. TẠO CÁC NÚT TAB CHỌN TÒA NHÀ
function taoNutChonToaNha() {
    const container = document.getElementById('danh-sach-nut-toa');
    const demTatCa = document.getElementById('dem-tat-ca-phong');
    if (demTatCa) demTatCa.textContent = danhSachPhong.length;
    if (!container) return;

    let html = `
        <button class="nut-tab-toa ${idKhuTroHienTai === 'tat_ca' ? 'kich-hoat' : ''}" onclick="chonToaNha('tat_ca')">
            <span>🏢</span> Tất cả Tòa Nhà (${danhSachPhong.length})
        </button>
    `;

    danhSachKhuTro.forEach(kt => {
        const soPhongToa = danhSachPhong.filter(p => p.id_khu_tro === kt.id).length;
        const isKichHoat = idKhuTroHienTai == kt.id ? 'kich-hoat' : '';
        html += `
            <button class="nut-tab-toa ${isKichHoat}" onclick="chonToaNha(${kt.id})">
                <span>🏢</span> ${kt.ten_khu_tro} (${soPhongToa})
            </button>
        `;
    });

    container.innerHTML = html;
}

function chonToaNha(idKhu) {
    idKhuTroHienTai = idKhu;
    taoNutChonToaNha();
    locDuLieu();
}

// 4. CHUYỂN ĐỔI 3 CHẾ ĐỘ XEM
function chuyenCheDoXem(cheDo) {
    cheDoXemHienTai = cheDo;
    ['matrix', 'table', 'assets'].forEach(c => {
        const tabBtn = document.getElementById(`tab-btn-${c}`);
        const viewEl = document.getElementById(`vung-xem-${c}`);
        if (tabBtn) tabBtn.classList.toggle('active', c === cheDo);
        if (viewEl) viewEl.style.display = (c === cheDo) ? 'block' : 'none';
    });

    // Ẩn/hiện bộ lọc tình trạng thiết bị tùy chế độ
    const locTB = document.getElementById('loc-tinh-trang-tb');
    const locTTPhong = document.getElementById('loc-theo-trang-thai');
    if (locTB) locTB.style.display = (cheDo === 'assets') ? 'inline-block' : 'none';
    if (locTTPhong) locTTPhong.style.display = (cheDo === 'assets') ? 'none' : 'inline-block';

    locDuLieu();
}

// 5. BỘ LỌC ĐA TẦNG & TÌM KIẾM
function locDuLieu() {
    const tuKhoa = (document.getElementById('tim-kiem-tu-khoa')?.value || '').toLowerCase().trim();
    const tangLoc = document.getElementById('loc-theo-tang')?.value || '';
    const trangThaiLoc = document.getElementById('loc-theo-trang-thai')?.value || '';
    const tinhTrangTBLoc = document.getElementById('loc-tinh-trang-tb')?.value || '';

    // Lọc danh sách phòng
    const ketQuaPhong = danhSachPhong.filter(p => {
        const matchToa = (idKhuTroHienTai === 'tat_ca') || (p.id_khu_tro == idKhuTroHienTai);
        const matchTang = !tangLoc || (String(p.tang) === String(tangLoc));
        const matchTrangThai = !trangThaiLoc || (p.trang_thai === trangThaiLoc);
        const matchTuKhoa = !tuKhoa || 
            (p.ma_phong && p.ma_phong.toLowerCase().includes(tuKhoa)) ||
            (p.ten_khu_tro && p.ten_khu_tro.toLowerCase().includes(tuKhoa)) ||
            (p.dia_chi_chi_tiet && p.dia_chi_chi_tiet.toLowerCase().includes(tuKhoa)) ||
            (p.quan_huyen && p.quan_huyen.toLowerCase().includes(tuKhoa));

        return matchToa && matchTang && matchTrangThai && matchTuKhoa;
    });

    // Lọc danh sách thiết bị
    const ketQuaThietBi = danhSachThietBi.filter(tb => {
        const matchToa = (idKhuTroHienTai === 'tat_ca') || (tb.id_khu_tro == idKhuTroHienTai);
        const matchTang = !tangLoc || (String(tb.tang) === String(tangLoc));
        const matchTuKhoa = !tuKhoa ||
            (tb.ten_thiet_bi && tb.ten_thiet_bi.toLowerCase().includes(tuKhoa)) ||
            (tb.ma_phong && tb.ma_phong.toLowerCase().includes(tuKhoa)) ||
            (tb.ten_khu_tro && tb.ten_khu_tro.toLowerCase().includes(tuKhoa));
        
        let matchTinhTrang = true;
        if (tinhTrangTBLoc === 'de_xuat_mua_moi') {
            matchTinhTrang = tb.canhBaoDeXuatMuaMoi === true;
        } else if (tinhTrangTBLoc) {
            matchTinhTrang = tb.trang_thai === tinhTrangTBLoc;
        }

        return matchToa && matchTang && matchTuKhoa && matchTinhTrang;
    });

    // Cập nhật bộ đếm hiển thị
    const demEl = document.getElementById('text-dem-ket-qua');
    if (demEl) {
        if (cheDoXemHienTai === 'assets') {
            demEl.textContent = `Hiển thị ${ketQuaThietBi.length} / ${danhSachThietBi.length} thiết bị`;
        } else {
            demEl.textContent = `Hiển thị ${ketQuaPhong.length} / ${danhSachPhong.length} phòng`;
        }
    }

    // Hiển thị view tương ứng
    if (cheDoXemHienTai === 'matrix') {
        hienThiSoDoPhanTang(ketQuaPhong);
    } else if (cheDoXemHienTai === 'table') {
        hienThiBangChiTiet(ketQuaPhong);
    } else if (cheDoXemHienTai === 'assets') {
        hienThiBangToanBoThietBi(ketQuaThietBi);
    }
}

// 6. VIEW 1: RENDER SƠ ĐỒ MẶT BẰNG PHÂN TẦNG (FLOOR MATRIX GRID)
function hienThiSoDoPhanTang(danhSach) {
    const container = document.getElementById('danh-sach-so-do-tang');
    if (!container) return;

    if (danhSach.length === 0) {
        container.innerHTML = `
            <div style="background:#ffffff; border-radius:14px; padding:48px 20px; text-align:center; border:1.5px dashed #cbd5e1;">
                <div style="font-size:36px; margin-bottom:10px;">🏢</div>
                <h3 style="color:#0f172a; font-weight:700;">Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại</h3>
                <p style="color:#64748b; font-size:13px; margin-top:4px;">Hãy thử đổi từ khóa tìm kiếm hoặc bấm nút "+ Thêm Phòng Trọ" để bổ sung mặt bằng mới.</p>
            </div>
        `;
        return;
    }

    // Gom nhóm theo Tòa Nhà (Khu trọ)
    const nhomTheoToa = {};
    danhSach.forEach(p => {
        const idKhu = p.id_khu_tro;
        if (!nhomTheoToa[idKhu]) {
            nhomTheoToa[idKhu] = {
                id: idKhu,
                ten: p.ten_khu_tro || `Tòa nhà #${idKhu}`,
                diaChi: `${p.dia_chi_chi_tiet || ''}${p.phuong_xa ? ', ' + p.phuong_xa : ''}${p.quan_huyen ? ', ' + p.quan_huyen : ''}${p.tinh_thanh ? ', ' + p.tinh_thanh : ''}`,
                phong: []
            };
        }
        nhomTheoToa[idKhu].phong.push(p);
    });

    let html = '';
    Object.values(nhomTheoToa).forEach(toa => {
        // Gom nhóm theo Tầng trong tòa này
        const nhomTheoTang = {};
        toa.phong.forEach(p => {
            const tangNum = Number(p.tang) || 1;
            if (!nhomTheoTang[tangNum]) {
                nhomTheoTang[tangNum] = [];
            }
            nhomTheoTang[tangNum].push(p);
        });

        // Sắp xếp tầng từ tầng 1 đến tầng N
        const danhSachTang = Object.keys(nhomTheoTang).map(Number).sort((a, b) => a - b);

        html += `
            <div class="khoi-toa-nha-container">
                <div class="header-toa-nha">
                    <div class="tieu-de-toa-nha">
                        <span style="font-size: 26px;">🏢</span>
                        <div>
                            <h2>${toa.ten}</h2>
                            <div class="dia-chi-toa">📍 ${toa.diaChi}</div>
                        </div>
                    </div>
                    <div>
                        <span class="badge-mini badge-trong" style="font-size:12.5px; padding:6px 12px;">
                            ${danhSachTang.length} Tầng • ${toa.phong.length} Phòng trọ
                        </span>
                    </div>
                </div>

                <!-- Danh sách các tầng của tòa -->
                <div class="danh-sach-tang-trong-toa">
                    ${danhSachTang.map(tang => {
                        const phongCuaTang = nhomTheoTang[tang];
                        const soTrong = phongCuaTang.filter(p => p.trang_thai === 'con_trong').length;
                        const soThue = phongCuaTang.filter(p => p.trang_thai === 'da_thue').length;
                        const tongTB = phongCuaTang.reduce((sum, p) => sum + (Number(p.tong_thiet_bi) || 0), 0);
                        const tongCanhBaoTB = phongCuaTang.reduce((sum, p) => sum + (Number(p.so_tb_canh_bao) || 0), 0);

                        return `
                            <div class="khoi-tang-nha">
                                <div class="header-tang">
                                    <div class="thong-tin-tang-trai">
                                        <span class="nhan-ten-tang">📶 TẦNG ${tang}</span>
                                        <span class="thong-ke-tang-pill">
                                            Tổng <strong>${phongCuaTang.length}</strong> phòng (${soTrong} trống • ${soThue} đã thuê) • <strong>${tongTB}</strong> thiết bị
                                            ${tongCanhBaoTB > 0 ? `<span class="badge-mini badge-de-xuat" style="margin-left:6px;">🚨 ${tongCanhBaoTB} TB &gt;60%</span>` : ''}
                                        </span>
                                    </div>
                                    <button class="nut-them-phong-tang" onclick="moModalThemPhong(${toa.id}, ${tang})">
                                        + Thêm phòng Tầng ${tang}
                                    </button>
                                </div>

                                <!-- Lưới các phòng trong tầng -->
                                <div class="luoi-the-phong">
                                    ${phongCuaTang.map(p => renderCardPhong(p)).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Render từng Thẻ Phòng Matrix
function renderCardPhong(p) {
    let anhBia = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';
    if (p.hinh_anh) {
        try {
            const parsed = JSON.parse(p.hinh_anh);
            if (Array.isArray(parsed) && parsed.length > 0) anhBia = parsed[0];
            else if (typeof parsed === 'string') anhBia = parsed;
        } catch(e) {
            anhBia = p.hinh_anh;
        }
    }

    const ttClass = `tt-${p.trang_thai}`;
    const ttText = p.trang_thai === 'con_trong' ? 'Còn trống 🗝️' : (p.trang_thai === 'da_thue' ? 'Đã thuê 🔒' : 'Bảo trì 🛠️');
    const tongTB = Number(p.tong_thiet_bi) || 0;
    const soCanhBao = Number(p.so_tb_canh_bao) || 0;

    return `
        <div class="the-phong-card trang-thai-${p.trang_thai}">
            <div class="header-the-phong">
                <span class="ma-phong-noi-bat">${p.ma_phong}</span>
                <span class="nhan-tt-phong ${ttClass}">${ttText}</span>
            </div>

            <img src="${anhBia}" class="anh-phong-card" alt="${p.ma_phong}" onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'; this.onerror=null;">

            <div class="thong-so-phong">
                <span class="gia-phong-card">${window.DinhDang ? window.DinhDang.tienVND(p.gia_thue) : (p.gia_thue + ' đ')}</span>
                <span class="dien-tich-phong-card">${p.dien_tich} m² • Tầng ${p.tang}</span>
            </div>

            <!-- Tóm tắt thiết bị phòng -->
            <div class="khoi-thiet-bi-phong-card">
                <div class="dong-thiet-bi-card">
                    <span>⚡ Thiết bị trang bị:</span>
                    <strong>${tongTB} món đồ</strong>
                </div>
                ${soCanhBao > 0 ? `
                    <div class="canh-bao-tb-card">
                        <span>🚨</span> <span>${soCanhBao} thiết bị cần thay mới (&gt;60%)</span>
                    </div>
                ` : `
                    <div style="font-size:11.5px; color:#059669; font-weight:600;">
                        ✓ Thiết bị hoạt động ổn định
                    </div>
                `}
            </div>

            <!-- Các nút hành động trên card -->
            <div class="hanh-dong-phong-card">
                <button class="nut-card-tb" onclick="moModalThietBi(${p.id}, '${p.ma_phong}', '${p.ten_khu_tro || ''}', ${p.tang || 1})">
                    🛠️ Sổ thiết bị
                </button>
                <button class="nut-card-map" onclick="moModalBanDo(${p.toa_do_lat || 10.732993}, ${p.toa_do_lng || 106.708893}, '${p.ma_phong}')">
                    🗺️ Tiện ích 2km
                </button>
            </div>

            <div class="hang-nut-phu-card">
                <button class="nut-xoa-mini" onclick="xoaPhong(${p.id})">🗑️ Xóa phòng</button>
            </div>
        </div>
    `;
}

// 7. VIEW 2: RENDER BẢNG DỮ LIỆU CHI TIẾT (TABLE VIEW)
function hienThiBangChiTiet(danhSach) {
    const tbody = document.getElementById('bang-danh-sach-phong');
    if (!tbody) return;

    if (danhSach.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; padding: 36px 20px; color: #64748b;">Không tìm thấy phòng nào phù hợp với bộ lọc!</td></tr>';
        return;
    }

    tbody.innerHTML = danhSach.map(p => {
        let anhBia = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150';
        if (p.hinh_anh) {
            try {
                const parsed = JSON.parse(p.hinh_anh);
                if (Array.isArray(parsed) && parsed.length > 0) anhBia = parsed[0];
                else if (typeof parsed === 'string') anhBia = parsed;
            } catch(e) { anhBia = p.hinh_anh; }
        }

        const ttText = p.trang_thai === 'con_trong' ? 'Còn trống 🗝️' : (p.trang_thai === 'da_thue' ? 'Đã thuê 🔒' : 'Bảo trì 🛠️');
        const ttClass = `tt-${p.trang_thai}`;
        const soCanhBao = Number(p.so_tb_canh_bao) || 0;
        const tongTB = Number(p.tong_thiet_bi) || 0;

        return `
            <tr>
                <td style="text-align: center; width: 55px;">
                    <img src="${anhBia}" class="anh-phong-nho" alt="${p.ma_phong}" onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150';">
                </td>
                <td>
                    <strong>${p.ten_khu_tro}</strong><br>
                    <small style="color:#64748b;">${p.dia_chi_chi_tiet || ''}${p.quan_huyen ? `, ${p.quan_huyen}` : ''}</small>
                </td>
                <td><span class="badge-mini badge-thue">Tầng ${p.tang}</span></td>
                <td><strong style="font-size:14.5px; color:#064e3b;">${p.ma_phong}</strong></td>
                <td><strong>${window.DinhDang ? window.DinhDang.tienVND(p.gia_thue) : p.gia_thue}</strong></td>
                <td>${p.dien_tich} m²</td>
                <td><span class="nhan-tt-phong ${ttClass}">${ttText}</span></td>
                <td>
                    <button class="nut-phu" onclick="moModalThietBi(${p.id}, '${p.ma_phong}', '${p.ten_khu_tro || ''}', ${p.tang || 1})">
                        ⚡ ${tongTB} TB ${soCanhBao > 0 ? `(<span style="color:#dc2626; font-weight:bold;">${soCanhBao} &gt;60%</span>)` : ''}
                    </button>
                </td>
                <td>
                    ${p.canh_bao_sap_het_han ? `
                        <span class="canh-bao-vang">⚠️ Sắp hết hạn (${window.DinhDang.ngayThang(p.ngay_het_han_hd)})</span>
                    ` : (p.ngay_het_han_hd ? window.DinhDang.ngayThang(p.ngay_het_han_hd) : '—')}
                </td>
                <td>
                    <button class="nut-phu" onclick="moModalBanDo(${p.toa_do_lat || 10.732993}, ${p.toa_do_lng || 106.708893}, '${p.ma_phong}')">🗺️ 2km</button>
                </td>
                <td>
                    <button class="nut-nguy-hiem" onclick="xoaPhong(${p.id})">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 8. VIEW 3: RENDER SỔ TÀI SẢN & THIẾT BỊ TOÀN DOANH NGHIỆP
function hienThiBangToanBoThietBi(danhSach) {
    const tbody = document.getElementById('bang-toan-bo-thiet-bi');
    if (!tbody) return;

    if (danhSach.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; padding: 36px 20px; color:#64748b;">Không có thiết bị nào phù hợp với bộ lọc hiện tại!</td></tr>';
        return;
    }

    tbody.innerHTML = danhSach.map(tb => {
        const tyLe = Number(tb.tyLeChiPhiSuaChua) || 0;
        let khauHaoClass = 'khau-hao-tot';
        if (tyLe >= 60) khauHaoClass = 'khau-hao-nguy-hiem';
        else if (tyLe >= 30) khauHaoClass = 'khau-hao-vua';

        const barWidth = Math.min(tyLe, 100);

        return `
            <tr>
                <td><small style="color:#64748b; font-weight:700;">#TB-${tb.id}</small></td>
                <td>
                    <strong style="font-size:13.5px; color:#0f172a;">${layIconThietBi(tb.ten_thiet_bi)} ${tb.ten_thiet_bi}</strong>
                </td>
                <td><small>🏢 ${tb.ten_khu_tro}</small></td>
                <td><span class="badge-mini badge-thue">Tầng ${tb.tang}</span></td>
                <td><strong style="color:#065f46;">${tb.ma_phong}</strong></td>
                <td>${window.DinhDang ? window.DinhDang.tienVND(tb.gia_tri) : tb.gia_tri}</td>
                <td>${window.DinhDang ? window.DinhDang.tienVND(tb.chi_phi_sua_luy_ke) : tb.chi_phi_sua_luy_ke}</td>
                <td>
                    <div class="khung-tien-do-khau-hao">
                        <div class="thanh-phan-tram-khau-hao">
                            <div class="ruot-khau-hao ${khauHaoClass}" style="width: ${barWidth}%;"></div>
                        </div>
                        <div class="so-phan-tram-text">
                            <span style="color:${tyLe >= 60 ? '#dc2626' : '#475569'};">${tyLe}%</span>
                            <small style="color:#94a3b8;">${tyLe >= 60 ? 'Vượt 60%' : 'Chuẩn'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    ${tb.canhBaoDeXuatMuaMoi ? `
                        <span class="badge-mini badge-de-xuat">🚨 ĐỀ XUẤT MUA MỚI (&gt;60%)</span>
                    ` : '<span class="badge-mini badge-trong">✓ Hoạt động tốt</span>'}
                </td>
                <td><small style="color:#64748b;">${tb.ngay_lap_dat ? window.DinhDang.ngayThang(tb.ngay_lap_dat) : '—'}</small></td>
                <td>
                    <div style="display:flex; gap:4px;">
                        <button class="nut-phu" style="padding:4px 8px; font-size:11px;" onclick="ghiBaoTri(${tb.id})">+ Bảo trì</button>
                        <button class="nut-nguy-hiem" style="padding:4px 8px; font-size:11px;" onclick="xoaThietBi(${tb.id})">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function layIconThietBi(ten) {
    const t = (ten || '').toLowerCase();
    if (t.includes('máy lạnh') || t.includes('điều hòa')) return '❄️';
    if (t.includes('tủ lạnh')) return '🧊';
    if (t.includes('máy giặt')) return '🧺';
    if (t.includes('nóng lạnh') || t.includes('bình nóng')) return '🔥';
    if (t.includes('bếp')) return '🍳';
    if (t.includes('khóa') || t.includes('vân tay')) return '🔐';
    if (t.includes('giường') || t.includes('nệm')) return '🛏️';
    if (t.includes('tủ quần áo')) return '🚪';
    if (t.includes('tivi')) return '📺';
    return '⚡';
}

// 9. MODAL THÊM TÒA NHÀ MỚI
function moModalThemToaNha() {
    document.getElementById('modal-them-toa-nha').style.display = 'flex';
    if (window.DiaChinhVN && window.DiaChinhVN.khoiTaoChonDiaChinh) {
        window.DiaChinhVN.khoiTaoChonDiaChinh('toa-tinh-thanh', 'toa-phuong-xa', 'TP. Hồ Chí Minh', 'Phường Tân Phong');
    }
}

function dongModalThemToaNha() {
    document.getElementById('modal-them-toa-nha').style.display = 'none';
    const f = document.getElementById('form-them-toa-nha');
    if (f) f.reset();
}

async function xuLyThemToaNha(e) {
    e.preventDefault();
    const tenKhuTro = document.getElementById('toa-ten').value.trim();
    const tinhThanh = document.getElementById('toa-tinh-thanh').value;
    const quanHuyen = document.getElementById('toa-quan-huyen') ? document.getElementById('toa-quan-huyen').value : '';
    const phuongXa = document.getElementById('toa-phuong-xa').value;
    const diaChiChiTiet = document.getElementById('toa-dia-chi-chi-tiet').value.trim();

    if (!tenKhuTro || !tinhThanh || !phuongXa || !diaChiChiTiet) {
        return window.hienThongBao('Vui lòng điền đầy đủ tên tòa nhà, tỉnh thành, phường xã và địa chỉ chi tiết!', 'canh_bao');
    }

    try {
        await window.GoiAPI.post('/chu-doanh-nghiep/khu-tro', {
            tenKhuTro, tinhThanh, quanHuyen: quanHuyen || '', phuongXa, diaChiChiTiet
        });
        window.hienThongBao(`Đã thêm tòa nhà "${tenKhuTro}" thành công!`, 'thanh_cong');
        dongModalThemToaNha();
        taiToanBoDuLieu();
    } catch (err) {
        window.hienThongBao('Lỗi thêm tòa nhà: ' + err.message, 'loi');
    }
}

// 10. MODAL THÊM PHÒNG TRỌ (GÁN VÀO TÒA NHÀ & TẦNG)
function capNhatSelectToaNhaForm() {
    const sel = document.getElementById('them-id-toa-nha');
    if (!sel) return;

    if (danhSachKhuTro.length === 0) {
        sel.innerHTML = '<option value="">-- Chưa có tòa nhà nào (hãy tạo tòa nhà trước) --</option>';
        return;
    }

    sel.innerHTML = danhSachKhuTro.map(kt => `
        <option value="${kt.id}">${kt.ten_khu_tro} (${kt.dia_chi_chi_tiet ? kt.dia_chi_chi_tiet + ', ' : ''}${kt.phuong_xa ? kt.phuong_xa + ', ' : ''}${kt.tinh_thanh || ''})</option>
    `).join('');
}

function moModalThemPhong(idKhuMacDinh = null, tangMacDinh = null) {
    document.getElementById('modal-them-phong').style.display = 'flex';
    capNhatSelectToaNhaForm();

    if (idKhuMacDinh) {
        const selToa = document.getElementById('them-id-toa-nha');
        if (selToa) selToa.value = idKhuMacDinh;
    }
    if (tangMacDinh) {
        const inpTang = document.getElementById('them-tang');
        if (inpTang) inpTang.value = tangMacDinh;
    }

    danhSachTepAnhDaChon = [];
    capNhatGiaoDienXemTruocAnh();
    ganSuKienCheckboxTienIch();
    khoiTaoSuKienKeoTha();
}

function dongModalThemPhong() {
    document.getElementById('modal-them-phong').style.display = 'none';
    const form = document.getElementById('form-them-phong');
    if (form) form.reset();
    danhSachTepAnhDaChon = [];
    capNhatGiaoDienXemTruocAnh();
}

async function xuLyThemPhong(e) {
    e.preventDefault();
    const idKhuTro = document.getElementById('them-id-toa-nha').value;
    const tang = document.getElementById('them-tang').value;
    const maPhong = document.getElementById('them-ma-phong').value.trim();
    const giaThue = document.getElementById('them-gia-thue').value;
    const dienTich = document.getElementById('them-dien-tich').value;
    const tienCoc = document.getElementById('them-tien-coc').value || giaThue;
    const donGiaDien = document.getElementById('them-don-gia-dien').value;
    const donGiaNuoc = document.getElementById('them-don-gia-nuoc').value;

    if (!idKhuTro) {
        return window.hienThongBao('Vui lòng chọn tòa nhà cho phòng!', 'canh_bao');
    }

    // 1. Tải ảnh nếu có
    let danhSachUrlAnh = [];
    if (danhSachTepAnhDaChon.length > 0) {
        window.hienThongBao(`Đang tải lên ${danhSachTepAnhDaChon.length} file ảnh từ máy tính...`, 'thong_tin');
        try {
            const formData = new FormData();
            danhSachTepAnhDaChon.forEach(file => formData.append('cac_anh', file));
            const token = window.LuuTru ? window.LuuTru.layToken() : '';
            const resUpload = await fetch('http://localhost:5000/api/v1/tai-len/nhieu-anh', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });
            const kqUpload = await resUpload.json();
            if (kqUpload.thanh_cong && kqUpload.du_lieu && kqUpload.du_lieu.danh_sach) {
                danhSachUrlAnh = kqUpload.du_lieu.danh_sach;
            }
        } catch (err) {
            console.error('Lỗi tải ảnh:', err);
        }
    }

    if (danhSachUrlAnh.length === 0) {
        danhSachUrlAnh = ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"];
    }

    // 2. Thu thập tiện ích / thiết bị
    const danhSachTienIch = Array.from(document.querySelectorAll('input[name="tien_ich"]:checked')).map(cb => cb.value);

    try {
        await window.GoiAPI.post('/phong-tro', {
            idKhuTro,
            tang,
            maPhong,
            giaThue,
            tienCoc,
            dienTich,
            donGiaDien,
            donGiaNuoc,
            hinhAnh: danhSachUrlAnh,
            tienIch: danhSachTienIch
        });

        window.hienThongBao(`Đã thêm phòng ${maPhong} tại Tầng ${tang} thành công!`, 'thanh_cong');
        dongModalThemPhong();
        taiToanBoDuLieu();
    } catch (loi) {
        window.hienThongBao('Lỗi thêm phòng: ' + loi.message, 'loi');
    }
}

async function xoaPhong(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng trọ này? Mọi thiết bị và hợp đồng liên quan sẽ bị xóa!')) return;
    try {
        await window.GoiAPI.delete(`/phong-tro/${id}`);
        window.hienThongBao('Đã xóa phòng trọ thành công!', 'thanh_cong');
        taiToanBoDuLieu();
    } catch (loi) {
        window.hienThongBao('Lỗi xóa phòng: ' + loi.message, 'loi');
    }
}

// 11. SỔ TAY THIẾT BỊ PHÒNG (MODAL THIẾT BỊ)
async function moModalThietBi(idPhong, maPhong, tenKhu = '', tang = 1) {
    idPhongDangChon = idPhong;
    document.getElementById('tieu-de-modal-tb').textContent = `Sổ Tay Thiết Bị Phòng ${maPhong}`;
    const viTriEl = document.getElementById('vi-tri-modal-tb');
    if (viTriEl) {
        viTriEl.innerHTML = `🏢 ${tenKhu || 'Tòa nhà'} ➔ 📶 Tầng ${tang} ➔ 🚪 Phòng <strong>${maPhong}</strong>`;
    }
    document.getElementById('modal-thiet-bi').style.display = 'flex';
    document.getElementById('form-nhap-thiet-bi').style.display = 'none';
    taiThietBiPhong(idPhong);
}

function dongModalThietBi() {
    document.getElementById('modal-thiet-bi').style.display = 'none';
    document.getElementById('form-nhap-thiet-bi').style.display = 'none';
}

async function taiThietBiPhong(idPhong) {
    try {
        const res = await window.GoiAPI.get(`/phong-tro/${idPhong}/thiet-bi`);
        const tbList = res.du_lieu || [];
        const tbody = document.getElementById('bang-thiet-bi');
        if (!tbody) return;

        if (tbList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">Phòng này chưa có thiết bị nào được lưu! Bấm "+ Thêm Thiết Bị" ở trên để bổ sung.</td></tr>';
            return;
        }

        tbody.innerHTML = tbList.map(tb => {
            const tyLe = Number(tb.tyLeChiPhiSuaChua) || 0;
            let khauHaoClass = 'khau-hao-tot';
            if (tyLe >= 60) khauHaoClass = 'khau-hao-nguy-hiem';
            else if (tyLe >= 30) khauHaoClass = 'khau-hao-vua';

            return `
                <tr>
                    <td><strong>${layIconThietBi(tb.ten_thiet_bi)} ${tb.ten_thiet_bi}</strong></td>
                    <td>${window.DinhDang ? window.DinhDang.tienVND(tb.gia_tri) : tb.gia_tri}</td>
                    <td>${window.DinhDang ? window.DinhDang.tienVND(tb.chi_phi_sua_luy_ke) : tb.chi_phi_sua_luy_ke}</td>
                    <td>
                        <div class="khung-tien-do-khau-hao">
                            <div class="thanh-phan-tram-khau-hao">
                                <div class="ruot-khau-hao ${khauHaoClass}" style="width: ${Math.min(tyLe, 100)}%;"></div>
                            </div>
                            <div class="so-phan-tram-text">
                                <span style="color:${tyLe >= 60 ? '#dc2626' : '#475569'};">${tyLe}%</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        ${tb.canhBaoDeXuatMuaMoi ? `
                            <span class="badge-mini badge-de-xuat">🚨 ĐỀ XUẤT MUA MỚI (&gt;60%)</span>
                        ` : '<span class="badge-mini badge-trong">Hoạt động tốt</span>'}
                    </td>
                    <td>
                        <button class="nut-phu" style="padding:4px 8px; font-size:11.5px;" onclick="ghiBaoTri(${tb.id})">+ Bảo trì</button>
                    </td>
                    <td>
                        <button class="nut-nguy-hiem" style="padding:4px 8px; font-size:11.5px;" onclick="xoaThietBi(${tb.id})">✕</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        console.error('Lỗi tải thiết bị phòng:', e);
    }
}

function hienFormThemTB() {
    const f = document.getElementById('form-nhap-thiet-bi');
    if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function luuThietBiMoi() {
    const tenThietBi = document.getElementById('ten-tb-moi').value.trim();
    const giaTri = document.getElementById('gia-tri-tb-moi').value;
    if (!tenThietBi || !giaTri) {
        return window.hienThongBao('Vui lòng nhập tên và giá trị thiết bị!', 'canh_bao');
    }

    try {
        await window.GoiAPI.post('/phong-tro/thiet-bi', {
            idPhong: idPhongDangChon, tenThietBi, giaTri
        });
        window.hienThongBao('Đã thêm thiết bị vào phòng thành công!', 'thanh_cong');
        document.getElementById('ten-tb-moi').value = '';
        document.getElementById('gia-tri-tb-moi').value = '';
        taiThietBiPhong(idPhongDangChon);
        taiToanBoThietBi();
        taiDanhSachPhong();
    } catch (e) {
        window.hienThongBao('Lỗi thêm thiết bị: ' + e.message, 'loi');
    }
}

async function ghiBaoTri(idThietBi) {
    const chiPhi = prompt('Nhập chi phí sửa chữa bảo trì lần này (VND):');
    if (!chiPhi || isNaN(chiPhi)) return;
    const noiDung = prompt('Nội dung sửa chữa bảo trì:');

    try {
        await window.GoiAPI.post('/phong-tro/thiet-bi/bao-tri', {
            idThietBi, chiPhi: Number(chiPhi), noiDung: noiDung || 'Bảo dưỡng linh kiện định kỳ'
        });
        window.hienThongBao('Đã ghi nhận bảo trì thành công!', 'thanh_cong');
        if (idPhongDangChon) taiThietBiPhong(idPhongDangChon);
        taiToanBoDuLieu();
    } catch (e) {
        window.hienThongBao('Lỗi ghi bảo trì: ' + e.message, 'loi');
    }
}

async function xoaThietBi(idThietBi) {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    try {
        await window.GoiAPI.delete(`/phong-tro/thiet-bi/${idThietBi}`);
        window.hienThongBao('Đã xóa thiết bị thành công!', 'thanh_cong');
        if (idPhongDangChon) taiThietBiPhong(idPhongDangChon);
        taiToanBoDuLieu();
    } catch (e) {
        window.hienThongBao('Lỗi xóa thiết bị: ' + e.message, 'loi');
    }
}

function moModalThemThietBiNhanh() {
    if (danhSachPhong.length === 0) {
        return window.hienThongBao('Chưa có phòng nào trong hệ thống!', 'canh_bao');
    }
    const idPhong = danhSachPhong[0].id;
    moModalThietBi(idPhong, danhSachPhong[0].ma_phong, danhSachPhong[0].ten_khu_tro, danhSachPhong[0].tang);
    hienFormThemTB();
}

// 12. BẢN ĐỒ TIỆN ÍCH LEAFLET 2KM
function moModalBanDo(lat, lng, maPhong) {
    document.getElementById('tieu-de-ban-do').textContent = `Bản Đồ Tiện Ích Bán Kính 2km Quanh Phòng ${maPhong}`;
    document.getElementById('modal-ban-do').style.display = 'flex';

    setTimeout(() => {
        if (!mapInstance) {
            mapInstance = L.map('ban-do-leaflet').setView([lat, lng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstance);
        } else {
            mapInstance.setView([lat, lng], 14);
        }

        mapInstance.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Circle) {
                mapInstance.removeLayer(layer);
            }
        });

        const iconPhong = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });

        L.marker([lat, lng], { icon: iconPhong }).addTo(mapInstance)
            .bindPopup(`<b>Vị trí phòng: ${maPhong}</b>`).openPopup();

        L.circle([lat, lng], {
            color: '#059669',
            fillColor: '#10b981',
            fillOpacity: 0.15,
            radius: 2000
        }).addTo(mapInstance).bindPopup('Bán kính tiện ích 2km xung quanh phòng');

        const tienIchXungQuanh = [
            { ten: '🏥 Bệnh viện đa khoa', lat: lat + 0.005, lng: lng + 0.004 },
            { ten: '🛒 Đại siêu thị mua sắm', lat: lat - 0.004, lng: lng - 0.003 },
            { ten: '🎓 Trường Đại học', lat: lat + 0.006, lng: lng - 0.005 },
            { ten: '🥬 Chợ dân sinh thực phẩm', lat: lat - 0.005, lng: lng + 0.006 }
        ];

        tienIchXungQuanh.forEach(ti => {
            L.marker([ti.lat, ti.lng]).addTo(mapInstance).bindPopup(`<b>${ti.ten}</b>`);
        });

        mapInstance.invalidateSize();
    }, 200);
}

function dongModalBanDo() {
    document.getElementById('modal-ban-do').style.display = 'none';
}

// 13. XỬ LÝ ẢNH KÉO THẢ & PREVIEW
function khoiTaoSuKienKeoTha() {
    const vungKeoTha = document.getElementById('vung-keo-tha-anh');
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
        xuLyThemTepAnh(dt.files);
    }, false);
}

function xuLyChonTepAnh(e) {
    xuLyThemTepAnh(e.target.files);
}

function xuLyThemTepAnh(files) {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            danhSachTepAnhDaChon.push(file);
        }
    }
    capNhatGiaoDienXemTruocAnh();
}

function capNhatGiaoDienXemTruocAnh() {
    const container = document.getElementById('danh-sach-xem-truoc-anh');
    const demEl = document.getElementById('so-luong-anh-chon');
    if (!container) return;

    if (danhSachTepAnhDaChon.length === 0) {
        container.innerHTML = '';
        if (demEl) demEl.textContent = 'Chưa chọn ảnh';
        return;
    }

    if (demEl) demEl.textContent = `Đã chọn ${danhSachTepAnhDaChon.length} file ảnh`;

    container.innerHTML = danhSachTepAnhDaChon.map((file, index) => {
        const urlTam = URL.createObjectURL(file);
        return `
            <div class="the-xem-truoc-anh">
                <img src="${urlTam}" alt="Ảnh ${index + 1}">
                <button type="button" class="nut-xoa-anh" onclick="xoaAnhDaChon(${index})">✕</button>
            </div>
        `;
    }).join('');
}

function xoaAnhDaChon(index) {
    danhSachTepAnhDaChon.splice(index, 1);
    capNhatGiaoDienXemTruocAnh();
}

// 14. TIỆN ÍCH PHÒNG CHECKLIST CHỌN NHANH
function chonNhanhTienNghi(kieu) {
    const checkboxes = document.querySelectorAll('input[name="tien_ich"]');
    const coBanList = ['Máy lạnh / Điều hòa', 'Bình nóng lạnh', 'Giường nệm cao cấp', 'Tủ quần áo', 'Nhà vệ sinh riêng khép kín'];

    checkboxes.forEach(cb => {
        const theCha = cb.closest('.the-tich-tien-ich');
        if (kieu === 'bo_tat_ca') {
            cb.checked = false;
        } else if (kieu === 'full') {
            cb.checked = true;
        } else if (kieu === 'co_ban') {
            cb.checked = coBanList.includes(cb.value);
        }
        if (theCha) {
            theCha.classList.toggle('da-chon', cb.checked);
        }
    });
}

function ganSuKienCheckboxTienIch() {
    document.querySelectorAll('.the-tich-tien-ich input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const theCha = this.closest('.the-tich-tien-ich');
            if (theCha) {
                theCha.classList.toggle('da-chon', this.checked);
            }
        });
    });
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (window.khoiTaoThanhBen) window.khoiTaoThanhBen();
    taiToanBoDuLieu();
});

// Gán toàn cục cho HTML onclick
window.chonToaNha = chonToaNha;
window.chuyenCheDoXem = chuyenCheDoXem;
window.locDuLieu = locDuLieu;
window.moModalThemToaNha = moModalThemToaNha;
window.dongModalThemToaNha = dongModalThemToaNha;
window.xuLyThemToaNha = xuLyThemToaNha;
window.moModalThemPhong = moModalThemPhong;
window.dongModalThemPhong = dongModalThemPhong;
window.xuLyThemPhong = xuLyThemPhong;
window.xoaPhong = xoaPhong;
window.moModalThietBi = moModalThietBi;
window.dongModalThietBi = dongModalThietBi;
window.hienFormThemTB = hienFormThemTB;
window.luuThietBiMoi = luuThietBiMoi;
window.ghiBaoTri = ghiBaoTri;
window.xoaThietBi = xoaThietBi;
window.moModalThemThietBiNhanh = moModalThemThietBiNhanh;
window.moModalBanDo = moModalBanDo;
window.dongModalBanDo = dongModalBanDo;
window.xuLyChonTepAnh = xuLyChonTepAnh;
window.xoaAnhDaChon = xoaAnhDaChon;
window.chonNhanhTienNghi = chonNhanhTienNghi;
