async function taiTatCaBaiDang(tuKhoa = '', giaMin = '', giaMax = '', choOGhep = '') {
    try {
        let url = `/bai-dang?tuKhoa=${encodeURIComponent(tuKhoa)}`;
        if (giaMin) url += `&giaMin=${giaMin}`;
        if (giaMax) url += `&giaMax=${giaMax}`;
        if (choOGhep !== '') url += `&choOGhep=${choOGhep}`;

        const res = await window.GoiAPI.get(url);
        const danhSach = res.du_lieu || [];
        const container = document.getElementById('danh-sach-phong-tim');
        if (!container) return;

        if (danhSach.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">Không tìm thấy phòng trọ nào phù hợp với bộ lọc.</div>';
            return;
        }

        container.innerHTML = danhSach.map(b => {
            let anh = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600';
            try {
                const arr = JSON.parse(b.danh_sach_anh);
                if (arr && arr.length > 0) anh = arr[0];
            } catch (e) {}

            return `
                <div class="the-bai-dang">
                    <div class="anh-bai-dang" style="background-image: url('${anh}');">
                        <span class="nhan-phong-trong">Còn phòng trống 🗝️</span>
                    </div>
                    <div class="noi-dung-the-tin">
                        <div>
                            <h3 class="tieu-de-tin" title="${b.tieu_de}">${b.tieu_de}</h3>
                            <div class="dia-chi-tin" title="${b.dia_chi_chi_tiet}, ${b.quan_huyen}">📍 ${b.dia_chi_chi_tiet}, ${b.quan_huyen}</div>
                            <div class="gia-va-dien-tich">
                                <strong>${window.DinhDang.tienVND(b.gia_thue)}/tháng</strong>
                                <span>📐 ${b.dien_tich} m²</span>
                            </div>

                            <!-- THÔNG TIN NGƯỜI ĐĂNG & LIÊN HỆ -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin: 8px 0; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 5px; color: #334155; font-weight: 600;">
                                    <span>👤</span>
                                    <span>${b.ten_chu || 'Chủ trọ'}</span>
                                </div>
                                <a href="tel:${b.sdt_chu || ''}" style="color: #059669; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 4px;" title="Bấm để gọi điện cho chủ trọ">
                                    📞 ${b.sdt_chu ? b.sdt_chu : 'Liên hệ'}
                                </a>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; border-top:1px solid #f1f5f9; padding-top:10px;">
                            <span style="font-size:12px; color:#10b981;">${b.cho_o_ghep ? '🤝 Nhận ở ghép' : '🚫 Ở riêng'}</span>
                            <div style="display: flex; gap: 6px;">
                                <button class="nut-phu" style="font-size:11px;" onclick="guiYeuCauOGhep(${b.id})">💌 Ghép phòng</button>
                                <a href="/cac_trang/cong_khai/chi_tiet_phong/chi_tiet_phong.html?id=${b.id}" class="nut-chinh" style="font-size:11px; text-decoration:none;">Xem chi tiết</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (loi) {
        console.error('Loi tai phong:', loi);
    }
}

function timKiemPhong() {
    const tuKhoa = document.getElementById('tu-khoa-phong').value.trim();
    const khoangGia = document.getElementById('loc-khoang-gia').value;
    const choOGhep = document.getElementById('loc-o-ghep').value;

    let giaMin = '', giaMax = '';
    if (khoangGia) {
        const parts = khoangGia.split('-');
        giaMin = parts[0];
        giaMax = parts[1];
    }

    taiTatCaBaiDang(tuKhoa, giaMin, giaMax, choOGhep);
}

async function guiYeuCauOGhep(idBaiDang) {
    const user = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    if (!user) {
        window.hienThongBao('Vui lòng đăng nhập tài khoản để gửi yêu cầu ở ghép!', 'canh_bao');
        setTimeout(() => window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html', 1000);
        return;
    }

    const loiNhan = await window.hienNhapLieu(
        'ĐĂNG KÝ Ở GHÉP PHÒNG TRỌ',
        'Nhập lời giới thiệu bản thân và thông tin liên hệ gửi đến chủ trọ:',
        'Xin chào chủ trọ, em rất quan tâm đến phòng trọ này và muốn liên hệ ở ghép ạ!'
    );
    if (!loiNhan) return; // Bấm hủy

    try {
        window.hienThongBao('Đang kết nối luồng chat trực tiếp với Chủ trọ...', 'thong_tin');

        // Gọi API backend lưu trực tiếp tin nhắn vào MySQL (Tuyệt đối không dùng LocalStorage)
        const res = await window.GoiAPI.post('/tin-nhan/dang-ky-o-ghep', {
            idBaiDang,
            loiNhan
        });

        window.hienThongBao('Đã kết nối hội thoại thành công! Đang chuyển đến khung chat...', 'thanh_cong');

        const idChu = res.du_lieu ? res.du_lieu.id_doi_phuong : '';
        setTimeout(() => {
            window.location.href = `/cac_trang/khach_thue/tin_nhan/tin_nhan.html?idDoiPhuong=${idChu}`;
        }, 800);
    } catch (e) {
        window.hienThongBao('Lỗi kết nối chat: ' + e.message, 'loi');
    }
}

window.timKiemPhong = timKiemPhong;
window.guiYeuCauOGhep = guiYeuCauOGhep;

document.addEventListener('DOMContentLoaded', () => taiTatCaBaiDang());
