// Tự động nạp thư viện thông báo SweetAlert2 & Toast nếu trang chưa nạp
(function() {
    if (!window.hienThongBao) {
        const s = document.createElement('script');
        s.src = '/tien_ich_dung_chung/thong_bao_dep.js';
        document.head.appendChild(s);
    }
})();

function layThongTinNguoiDungHeader() {
    if (window.LuuTru && typeof window.LuuTru.layNguoiDung === 'function') {
        return window.LuuTru.layNguoiDung();
    }
    try {
        const u = localStorage.getItem('thong_tin_nguoi_dung');
        return u ? JSON.parse(u) : null;
    } catch (e) {
        return null;
    }
}

function khoiTaoThanhDieuHuong() {
    const user = layThongTinNguoiDungHeader();
    const header = document.querySelector('.thanh-dieu-huong');
    if (!header) return;

    // 1. Nâng cấp thương hiệu góc trái (.tdh-trai)
    const tdhTrai = header.querySelector('.tdh-trai');
    if (tdhTrai) {
        let roleName = 'HỆ THỐNG SMART';
        if (user) {
            const mapRole = {
                chu_doanh_nghiep: 'PORTAL CHỦ TRỌ',
                nhan_vien: 'PORTAL NHÂN VIÊN',
                admin: 'PORTAL ADMIN',
                khach_thue: 'CỔNG KHÁCH THUÊ'
            };
            roleName = mapRole[user.vai_tro] || 'PHÒNG TRỌ SMART';
        }

        // Kiểm tra nút toggle sidebar
        let nutToggle = tdhTrai.querySelector('#nut-toggle-sidebar');
        const toggleHtml = nutToggle ? '' : `<button id="nut-toggle-sidebar" class="nut-icon" title="Đóng/mở Menu">☰</button>`;

        tdhTrai.innerHTML = `
            ${toggleHtml}
            <a href="/" class="logo-thuong-hieu">
                <div class="khung-logo-nav">
                    <img src="/tai_nguyen_dung_chung/hinh_anh/logo.png" alt="Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <span style="display:none; font-size: 20px;">🏠</span>
                </div>
                <div class="khung-chu-logo">
                    <span class="dong-ten-thuong-hieu">PHÒNG TRỌ <strong>SMART</strong></span>
                    <span class="dong-phu-thuong-hieu">${roleName}</span>
                </div>
            </a>
        `;

        // Bắt sự kiện toggle menu
        const btnToggleMoi = tdhTrai.querySelector('#nut-toggle-sidebar');
        if (btnToggleMoi) {
            btnToggleMoi.onclick = () => {
                const sidebar = document.getElementById('thanh-ben-he-thong');
                if (sidebar) {
                    sidebar.classList.toggle('thu-gon');
                }
            };
        }
    }

    // 2. Nâng cấp khu vực người dùng góc phải (.tdh-phai)
    const tdhPhai = header.querySelector('.tdh-phai');
    if (tdhPhai) {
        let tenHienThi = 'Khách vãng lai';
        let vaiTroText = 'Chưa đăng nhập';
        let chuCaiDau = 'K';

        if (user) {
            tenHienThi = user.ho_ten || 'Người dùng';
            const tenVaiTro = {
                admin: 'Quản trị viên',
                chu_doanh_nghiep: 'Chủ doanh nghiệp',
                nhan_vien: 'Nhân viên vận hành',
                khach_thue: 'Khách thuê'
            };
            vaiTroText = tenVaiTro[user.vai_tro] || user.vai_tro;
            const words = tenHienThi.trim().split(' ');
            chuCaiDau = (words.length > 1 ? words[words.length - 2][0] + words[words.length - 1][0] : tenHienThi.substring(0, 2)).toUpperCase();
        }

        const linkThongBao = user && user.vai_tro === 'chu_doanh_nghiep' 
            ? '/cac_trang/chu_doanh_nghiep/thong_bao/thong_bao.html' 
            : '/cac_trang/khach_thue/thong_bao/thong_bao.html';

        tdhPhai.innerHTML = `
            <!-- Realtime Socket.IO Status -->
            <div class="trang-thai-realtime-badge" title="Đang kết nối Realtime Socket.IO">
                <span class="cham-xanh-pulse"></span>
                <span>Realtime Online</span>
            </div>

            <!-- Nút Chuông Thông Báo -->
            <button type="button" class="nut-chuong-thong-bao" title="Thông báo & Cảnh báo SOS" onclick="window.location.href='${linkThongBao}'">
                <span>🔔</span>
                <span class="cham-thong-bao-do"></span>
            </button>

            <!-- Thẻ Profile User -->
            <div class="the-ho-so-header">
                <div class="avatar-tron-header">
                    <span>${chuCaiDau}</span>
                    <span class="online-dot"></span>
                </div>
                <div class="ten-va-vai-tro-header">
                    <span class="ten-header">${tenHienThi}</span>
                    <span class="vai-tro-header">${vaiTroText}</span>
                </div>
            </div>

            <!-- Nút Đăng Xuất -->
            <button id="nut-dang-xuat" class="nut-dang-xuat">
                ${user ? '<span>↪</span> Đăng xuất' : '<span>🔐</span> Đăng nhập'}
            </button>
        `;

        const nutDangXuat = document.getElementById('nut-dang-xuat');
        if (nutDangXuat) {
            if (user) {
                nutDangXuat.onclick = async () => {
                    const xacNhan = window.hienXacNhan 
                        ? await window.hienXacNhan('Đăng xuất tài khoản', 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?', 'Đăng xuất', 'Ở lại')
                        : confirm('Bạn có chắc chắn muốn đăng xuất không?');

                    if (xacNhan) {
                        if (window.LuuTru && typeof window.LuuTru.dangXuat === 'function') {
                            window.LuuTru.dangXuat();
                        } else {
                            localStorage.removeItem('token_nguoi_dung');
                            localStorage.removeItem('thong_tin_nguoi_dung');
                            window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html';
                        }
                    }
                };
            } else {
                nutDangXuat.onclick = () => {
                    window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html';
                };
            }
        }
    }

    // 3. Khởi tạo kết nối Socket.IO realtime
    if (window.khoiTaoKetNoiSocket) {
        window.khoiTaoKetNoiSocket();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', khoiTaoThanhDieuHuong);
} else {
    khoiTaoThanhDieuHuong();
}
