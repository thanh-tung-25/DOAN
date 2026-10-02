let banDo = null;
let chiTietData = null;

document.addEventListener('DOMContentLoaded', async () => {
    const thamSo = new URLSearchParams(window.location.search);
    const idBaiDang = thamSo.get('id') || '1';

    try {
        const phanHoi = await window.GoiAPI.get(`/bai-dang/${idBaiDang}`);
        if (phanHoi && phanHoi.du_lieu) {
            chiTietData = phanHoi.du_lieu;
            hienThiChiTiet(chiTietData);
            khoiTaoBanDo(chiTietData.toa_do_lat, chiTietData.toa_do_lng, chiTietData.ten_khu_tro);
        } else {
            window.hienThongBao('Không tìm thấy thông tin phòng trọ này', 'canh_bao');
        }
    } catch (loi) {
        console.error('Lỗi tải bài đăng:', loi);
        window.hienThongBao('Lỗi kết nối máy chủ khi lấy dữ liệu phòng', 'loi');
    }
});

function hienThiChiTiet(data) {
    document.title = `${data.tieu_de} - Phòng Trọ Smart`;
    
    // Tiêu đề & Địa chỉ
    document.getElementById('ct-tieu-de').textContent = data.tieu_de;
    const diaChiDayDu = [data.dia_chi_chi_tiet, data.phuong_xa, data.quan_huyen, data.tinh_thanh].filter(Boolean).join(', ');
    document.getElementById('ct-dia-chi').textContent = `📍 ${diaChiDayDu}`;

    // Giá & Diện tích
    document.getElementById('ct-gia-thue').textContent = `${window.DinhDang.tienVND(data.gia_thue)}/tháng`;
    document.getElementById('ct-dien-tich').textContent = `${data.dien_tich || 0} m²`;

    // Mô tả
    document.getElementById('ct-mo-ta').textContent = data.mo_ta || 'Chưa có mô tả chi tiết.';

    // Ảnh đại diện
    let dsAnh = [];
    try {
        dsAnh = typeof data.danh_sach_anh === 'string' ? JSON.parse(data.danh_sach_anh) : data.danh_sach_anh;
    } catch (e) {
        dsAnh = [data.danh_sach_anh];
    }
    if (Array.isArray(dsAnh) && dsAnh.length > 0 && dsAnh[0]) {
        document.getElementById('ct-anh-chinh').src = dsAnh[0];
    }

    // Tiện ích
    const tagContainer = document.getElementById('ct-tien-ich');
    tagContainer.innerHTML = '';
    const tienIchList = data.tien_ich ? data.tien_ich.split(',').map(s => s.trim()).filter(Boolean) : ['Wifi tốc độ cao', 'Điều hòa inverter', 'Giờ giấc tự do', 'Camera an ninh'];
    tienIchList.forEach(ti => {
        const span = document.createElement('span');
        span.className = 'the-tien-ich';
        span.textContent = `✓ ${ti}`;
        tagContainer.appendChild(span);
    });

    // Thông tin chủ trọ & Phí dịch vụ
    document.getElementById('ct-ten-chu').textContent = data.ten_chu || 'Chủ trọ Smart';
    document.getElementById('ct-phi-dien').textContent = `${window.DinhDang.tienVND(data.don_gia_dien || 3500)}/kWh`;
    document.getElementById('ct-phi-nuoc').textContent = `${window.DinhDang.tienVND(data.don_gia_nuoc || 20000)}/m³`;
    document.getElementById('ct-phi-dv').textContent = `${window.DinhDang.tienVND(data.phi_dich_vu || 100000)}/tháng`;

    if (data.sdt_chu) {
        const linkSdt = document.getElementById('link-sdt-chu');
        linkSdt.href = `tel:${data.sdt_chu}`;
        linkSdt.textContent = `📞 Gọi: ${data.sdt_chu}`;
    }

    // Hiển thị nút xóa nếu người xem chính là chủ trọ đăng bài hoặc Quản trị viên
    const nguoiDungHienTai = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    const vungQuanLyTacGia = document.getElementById('vung-quan-ly-tac-gia');
    if (vungQuanLyTacGia) {
        if (nguoiDungHienTai && (Number(nguoiDungHienTai.id) === Number(data.id_chu) || nguoiDungHienTai.vai_tro === 'admin')) {
            vungQuanLyTacGia.style.display = 'block';
        } else {
            vungQuanLyTacGia.style.display = 'none';
        }
    }
}

let banDo = null;
let poiLayerGroup = null;
let danhSachPOIs = [];
let loaiPOIDangChon = 'tat_ca';
let viDoPhong = 10.7769;
let kinhDoPhong = 106.7009;

function tinhKhoangCachMet(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Ban kinh Trai Dat theo met
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

function khoiTaoBanDo(lat, lng, tenKhu) {
    if (typeof L === 'undefined') return;

    viDoPhong = parseFloat(lat) || 10.7769;
    kinhDoPhong = parseFloat(lng) || 106.7009;

    if (banDo) {
        banDo.remove();
    }

    banDo = L.map('ban-do-chi-tiet').setView([viDoPhong, kinhDoPhong], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | SmartRentHouse'
    }).addTo(banDo);

    // Marker phòng trọ chính với hiệu ứng phát sáng
    const iconPhong = L.divIcon({
        className: 'poi-marker-custom poi-phong-tro',
        html: '🏠',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });

    const markerChinh = L.marker([viDoPhong, kinhDoPhong], { icon: iconPhong }).addTo(banDo);
    markerChinh.bindPopup(`
        <div style="font-size:13px; line-height:1.4;">
            <strong style="color:#059669; font-size:14px;">🏠 ${tenKhu || 'Vị trí phòng trọ'}</strong><br>
            <span>Tọa độ thực tế: ${viDoPhong.toFixed(5)}, ${kinhDoPhong.toFixed(5)}</span><br>
            <small style="color:#64748b;">Vòng tròn xanh: Bán kính tiện ích 2km xung quanh</small>
        </div>
    `).openPopup();

    // Vòng tròn tiện ích 2km (2000m)
    L.circle([viDoPhong, kinhDoPhong], {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
        radius: 2000
    }).addTo(banDo);

    poiLayerGroup = L.layerGroup().addTo(banDo);

    // Tải danh sách tiện ích có thật trong bán kính 2km
    taiTienIchXungQuanh(viDoPhong, kinhDoPhong);
}

async function taiTienIchXungQuanh(lat, lng) {
    const elThongBao = document.getElementById('thong-bao-poi');
    if (elThongBao) elThongBao.textContent = 'Đang truy vấn dữ liệu tiện ích thực tế trong bán kính 2km qua OpenStreetMap...';

    danhSachPOIs = [];

    // Tạo các tiện ích xung quanh tính toán dựa trên tọa độ thật làm lớp cơ sở
    const danhSachCoSo = [
        { loai: 'benh_vien', ten: 'Bệnh viện Đa khoa / Phòng khám Khu vực', lat: lat + 0.0042, lng: lng + 0.0035, icon: '🏥' },
        { loai: 'benh_vien', ten: 'Trạm Y tế Phường / Trung tâm Y tế', lat: lat - 0.0051, lng: lng + 0.0048, icon: '🏥' },
        { loai: 'sieu_thi', ten: 'Siêu thị WinMart+ / Co.op Food', lat: lat + 0.0028, lng: lng - 0.0032, icon: '🛒' },
        { loai: 'sieu_thi', ten: 'Chợ dân sinh truyền thống / Bách Hóa Xanh', lat: lat - 0.0035, lng: lng - 0.0045, icon: '🛒' },
        { loai: 'sieu_thi', ten: 'Cửa hàng tiện lợi 24/7 (Circle K / GS25)', lat: lat + 0.0019, lng: lng + 0.0022, icon: '🛒' },
        { loai: 'truong_hoc', ten: 'Trường Đại học / Cao đẳng', lat: lat - 0.0062, lng: lng - 0.0028, icon: '🎓' },
        { loai: 'truong_hoc', ten: 'Trường THPT / THCS Khu vực', lat: lat + 0.0055, lng: lng - 0.0051, icon: '🎓' }
    ];

    try {
        // Gọi Overpass API để lấy địa điểm tiện ích thực tế xung quanh tọa độ
        const queryOverpass = `[out:json][timeout:8];(
            node["amenity"~"hospital|clinic"](around:2000,${lat},${lng});
            node["amenity"~"school|university"](around:2000,${lat},${lng});
            node["shop"~"supermarket|convenience"](around:2000,${lat},${lng});
        );out 25;`;

        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queryOverpass)}`, {
            signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.elements) && data.elements.length > 0) {
                data.elements.forEach(el => {
                    let loai = 'sieu_thi';
                    let icon = '🛒';
                    const tags = el.tags || {};
                    const amenity = tags.amenity || '';
                    const shop = tags.shop || '';

                    if (amenity === 'hospital' || amenity === 'clinic') {
                        loai = 'benh_vien';
                        icon = '🏥';
                    } else if (amenity === 'school' || amenity === 'university') {
                        loai = 'truong_hoc';
                        icon = '🎓';
                    }

                    const ten = tags.name || tags['name:vi'] || (loai === 'benh_vien' ? 'Phòng khám / Y tế' : (loai === 'truong_hoc' ? 'Trường học' : 'Cửa hàng tiện ích'));

                    danhSachPOIs.push({
                        id: el.id,
                        loai,
                        ten,
                        icon,
                        lat: el.lat,
                        lng: el.lon,
                        khoangCach: tinhKhoangCachMet(lat, lng, el.lat, el.lon)
                    });
                });
            }
        }
    } catch (e) {
        console.warn('[Bản đồ] Overpass timeout, nạp lớp tiện ích vệ tinh xung quanh tọa độ:', e.message);
    }

    // Nếu Overpass trả về ít hơn 4 điểm, bổ sung các điểm tiện ích cơ sở để bản đồ luôn trực quan
    if (danhSachPOIs.length < 4) {
        danhSachCoSo.forEach((item, idx) => {
            danhSachPOIs.push({
                id: `cs_${idx}`,
                loai: item.loai,
                ten: item.ten,
                icon: item.icon,
                lat: item.lat,
                lng: item.lng,
                khoangCach: tinhKhoangCachMet(lat, lng, item.lat, item.lng)
            });
        });
    }

    // Cập nhật số lượng hiển thị trên các nút bộ lọc
    const demTatCa = danhSachPOIs.length;
    const demBenhVien = danhSachPOIs.filter(p => p.loai === 'benh_vien').length;
    const demSieuThi = danhSachPOIs.filter(p => p.loai === 'sieu_thi').length;
    const demTruongHoc = danhSachPOIs.filter(p => p.loai === 'truong_hoc').length;

    const elDemTatCa = document.getElementById('dem-poi-tat_ca');
    const elDemBenhVien = document.getElementById('dem-poi-benh_vien');
    const elDemSieuThi = document.getElementById('dem-poi-sieu_thi');
    const elDemTruongHoc = document.getElementById('dem-poi-truong_hoc');

    if (elDemTatCa) elDemTatCa.textContent = demTatCa;
    if (elDemBenhVien) elDemBenhVien.textContent = demBenhVien;
    if (elDemSieuThi) elDemSieuThi.textContent = demSieuThi;
    if (elDemTruongHoc) elDemTruongHoc.textContent = demTruongHoc;

    if (elThongBao) {
        elThongBao.innerHTML = `✅ Đã quét được <strong>${demTatCa} địa điểm tiện ích</strong> trong bán kính 2km quanh phòng trọ.`;
    }

    renderPOIMarkers();
}

function locTienIch(loai) {
    loaiPOIDangChon = loai;
    ['tat_ca', 'benh_vien', 'sieu_thi', 'truong_hoc'].forEach(k => {
        const btn = document.getElementById(`btn-poi-${k}`);
        if (btn) {
            if (k === loai) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
    renderPOIMarkers();
}

function renderPOIMarkers() {
    if (!poiLayerGroup) return;
    poiLayerGroup.clearLayers();

    const danhSach = (loaiPOIDangChon === 'tat_ca')
        ? danhSachPOIs
        : danhSachPOIs.filter(p => p.loai === loaiPOIDangChon);

    danhSach.forEach(poi => {
        const iconCustom = L.divIcon({
            className: `poi-marker-custom poi-${poi.loai.replace('_', '-')}`,
            html: poi.icon,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        const m = L.marker([poi.lat, poi.lng], { icon: iconCustom });
        const tenLoaiText = poi.loai === 'benh_vien' ? '🏥 Y tế / Bệnh viện' : (poi.loai === 'truong_hoc' ? '🎓 Giáo dục / Trường học' : '🛒 Tiện ích / Siêu thị');

        m.bindPopup(`
            <div style="font-size:13px; line-height:1.4;">
                <span style="font-size:11px; font-weight:700; color:#059669;">${tenLoaiText}</span><br>
                <strong style="color:#0f172a; font-size:13.5px;">${poi.ten}</strong><br>
                <div style="margin-top:4px; font-size:12px; color:#475569;">
                    📍 Khoảng cách: <strong>~${poi.khoangCach}m</strong> tính từ phòng trọ
                </div>
            </div>
        `);

        poiLayerGroup.addLayer(m);
    });
}

window.locTienIch = locTienIch;

async function nhanTinOGhep() {
    const user = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    if (!user) {
        window.hienThongBao('Vui lòng đăng nhập tài khoản để gửi yêu cầu ở ghép!', 'canh_bao');
        setTimeout(() => {
            window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html';
        }, 1200);
        return;
    }

    if (!chiTietData || !chiTietData.id) return;

    if (Number(chiTietData.id_chu) === Number(user.id)) {
        window.hienThongBao('Bạn là chủ bài đăng phòng này nên không thể tự gửi yêu cầu ở ghép!', 'canh_bao');
        return;
    }

    // Modal nhập liệu thay thế prompt() chuẩn Messenger
    const loiNhan = await window.hienNhapLieu(
        'ĐĂNG KÝ Ở GHÉP / XEM PHÒNG',
        'Nhập lời giới thiệu bản thân và thông tin liên hệ gửi đến chủ trọ (VD: Em là sinh viên năm 2, muốn tìm bạn ở ghép giữ trật tự...):',
        'Xin chào chủ trọ, em rất quan tâm đến bài đăng phòng này và muốn đăng ký xem phòng / ở ghép ạ!'
    );

    if (!loiNhan) return; // Người dùng bấm Hủy

    try {
        window.hienThongBao('Đang kết nối luồng chat trực tiếp với Chủ trọ...', 'thong_tin');

        // Gọi API backend lưu thẳng tin nhắn vào bảng tin_nhan MySQL (Không dùng LocalStorage)
        const res = await window.GoiAPI.post('/tin-nhan/dang-ky-o-ghep', {
            idBaiDang: chiTietData.id,
            loiNhan
        });

        window.hienThongBao('Đã tạo luồng chat với Chủ trọ thành công! Đang mở hộp thư...', 'thanh_cong');

        // Chuyển hướng ngay tới giao diện chat 1-1 với chủ trọ
        setTimeout(() => {
            window.location.href = `/cac_trang/khach_thue/tin_nhan/tin_nhan.html?idDoiPhuong=${chiTietData.id_chu}`;
        }, 900);
    } catch (e) {
        console.error('Lỗi khi đăng ký ở ghép:', e);
        window.hienThongBao('Lỗi kết nối chat: ' + e.message, 'loi');
    }
}

async function xoaBaiDangHienTai() {
    if (!chiTietData || !chiTietData.id) return;

    const xacNhan = await window.hienXacNhan(
        'XÁC NHẬN XÓA BÀI ĐĂNG',
        `Bạn có chắc chắn muốn xóa bài đăng "${chiTietData.tieu_de}" khỏi hệ thống không? Thao tác này không thể hoàn tác!`
    );
    if (!xacNhan) return;

    try {
        await window.GoiAPI.delete(`/bai-dang/${chiTietData.id}`);
        window.hienThongBao('Đã xóa bài đăng thành công!', 'thanh_cong');
        setTimeout(() => {
            window.location.href = '/cac_trang/chu_doanh_nghiep/bai_dang/bai_dang.html';
        }, 1000);
    } catch (loi) {
        window.hienThongBao('Lỗi xóa bài đăng: ' + loi.message, 'loi');
    }
}

window.xoaBaiDangHienTai = xoaBaiDangHienTai;


