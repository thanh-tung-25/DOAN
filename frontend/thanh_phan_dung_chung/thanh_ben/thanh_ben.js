const MENU_THEO_VAI_TRO = {
    chu_doanh_nghiep: [
        {
            nhom: 'TỔNG QUAN & BẤT ĐỘNG SẢN',
            danhSach: [
                { tieuDe: 'Thống kê & Doanh thu', icon: '📈', link: '/cac_trang/chu_doanh_nghiep/thong_ke/thong_ke.html', badge: 'Live' },
                { tieuDe: 'Phòng trọ & Thiết bị', icon: '🏢', link: '/cac_trang/chu_doanh_nghiep/phong_tro/phong_tro.html' },
                { tieuDe: 'Bài đăng cho thuê', icon: '📢', link: '/cac_trang/chu_doanh_nghiep/bai_dang/bai_dang.html' }
            ]
        },
        {
            nhom: 'QUẢN LÝ THUÊ & TÀI CHÍNH',
            danhSach: [
                { tieuDe: 'Hợp đồng & Ký số', icon: '📝', link: '/cac_trang/chu_doanh_nghiep/hop_dong/hop_dong.html' },
                { tieuDe: 'Hóa đơn & VietQR', icon: '💳', link: '/cac_trang/chu_doanh_nghiep/hoa_don/hoa_don.html' },
                { tieuDe: 'Tin nhắn trực tiếp', icon: '💬', link: '/cac_trang/chu_doanh_nghiep/tin_nhan/tin_nhan.html' }
            ]
        },
        {
            nhom: 'TIỆN ÍCH & VẬN HÀNH',
            danhSach: [
                { tieuDe: 'Trợ lý ảo AI Chatbot', icon: '🤖', link: '/cac_trang/chu_doanh_nghiep/cau_hinh_chatbot/cau_hinh_chatbot.html', badge: 'AI 4.0' },
                { tieuDe: 'Quản lý Nhân viên', icon: '👥', link: '/cac_trang/chu_doanh_nghiep/quan_ly_nhan_vien/quan_ly_nhan_vien.html' },
                { tieuDe: 'Phân quyền RBAC', icon: '🔐', link: '/cac_trang/chu_doanh_nghiep/phan_quyen/phan_quyen.html' },
                { tieuDe: 'Báo động SOS & Sự cố', icon: '🚨', link: '/cac_trang/chu_doanh_nghiep/thong_bao/thong_bao.html', sos: true }
            ]
        }
    ],
    nhan_vien: [
        {
            nhom: 'VẬN HÀNH THỰC ĐỊA',
            danhSach: [
                { tieuDe: 'Tổng quan vận hành', icon: '📋', link: '/cac_trang/nhan_vien/tong_quan_van_hanh/tong_quan_van_hanh.html' },
                { tieuDe: 'Chỉ số & Thu tiền mặt', icon: '⚡', link: '/cac_trang/nhan_vien/chi_so_hoa_don/chi_so_hoa_don.html' },
                { tieuDe: 'Sự cố & Bảo trì', icon: '🔧', link: '/cac_trang/nhan_vien/su_co_bao_tri/su_co_bao_tri.html' },
                { tieuDe: 'Khách thuê & Check-in', icon: '🔑', link: '/cac_trang/nhan_vien/khach_thue_hop_dong/khach_thue_hop_dong.html' }
            ]
        }
    ],
    khach_thue: [
        {
            nhom: 'THUÊ TRỌ & HỢP ĐỒNG',
            danhSach: [
                { tieuDe: 'Tìm & Thuê phòng', icon: '🔍', link: '/cac_trang/khach_thue/tim_phong/tim_phong.html' },
                { tieuDe: 'Hợp đồng của tôi', icon: '📄', link: '/cac_trang/khach_thue/hop_dong/hop_dong.html' },
                { tieuDe: 'Hóa đơn & VietQR', icon: '💳', link: '/cac_trang/khach_thue/hoa_don/hoa_don.html' }
            ]
        },
        {
            nhom: 'TIỆN ÍCH & LIÊN HỆ',
            danhSach: [
                { tieuDe: 'Tin nhắn & Chatbot', icon: '💬', link: '/cac_trang/khach_thue/tin_nhan/tin_nhan.html' },
                { tieuDe: 'Hồ sơ cá nhân', icon: '👤', link: '/cac_trang/khach_thue/ho_so/ho_so.html' },
                { tieuDe: 'Thông báo & SOS', icon: '🔔', link: '/cac_trang/khach_thue/thong_bao/thong_bao.html' }
            ]
        }
    ],
    admin: [
        {
            nhom: 'QUẢN TRỊ NỀN TẢNG',
            danhSach: [
                { tieuDe: 'Định danh & KYC', icon: '🪪', link: '/cac_trang/admin/dinh_danh_tai_khoan/dinh_danh_tai_khoan.html' },
                { tieuDe: 'Kiểm duyệt nội dung', icon: '🛡️', link: '/cac_trang/admin/kiem_duyet_noi_dung/kiem_duyet_noi_dung.html' },
                { tieuDe: 'Đối soát hoa hồng', icon: '💰', link: '/cac_trang/admin/doi_soat_hoa_hong/doi_soat_hoa_hong.html' },
                { tieuDe: 'Thống kê nền tảng', icon: '📊', link: '/cac_trang/admin/thong_ke_nen_tang/thong_ke_nen_tang.html' }
            ]
        }
    ]
};

function layThongTinNguoiDungSidebar() {
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

function khoiTaoThanhBen() {
    const user = layThongTinNguoiDungSidebar();
    const sidebar = document.getElementById('thanh-ben-he-thong');
    if (!sidebar) return;

    const vaiTro = user ? user.vai_tro : 'khach_thue';
    const menuGroups = MENU_THEO_VAI_TRO[vaiTro] || MENU_THEO_VAI_TRO.khach_thue;

    const tenPhanHe = {
        admin: 'QUẢN TRỊ ADMIN',
        chu_doanh_nghiep: 'QUẢN TRỊ CHỦ TRỌ',
        nhan_vien: 'VẬN HÀNH THỰC ĐỊA',
        khach_thue: 'CỔNG KHÁCH THUÊ'
    };

    let tenHienThi = user ? (user.ho_ten || 'Người dùng') : 'Khách vãng lai';
    let vaiTroText = user ? (vaiTro === 'chu_doanh_nghiep' ? 'Chủ Doanh Nghiệp' : (vaiTro === 'nhan_vien' ? 'Nhân Viên' : (vaiTro === 'admin' ? 'Quản Trị Viên' : 'Khách Thuê'))) : 'Khách vãng lai';
    const words = tenHienThi.trim().split(' ');
    const chuCaiDau = (words.length > 1 ? words[words.length - 2][0] + words[words.length - 1][0] : tenHienThi.substring(0, 2)).toUpperCase();

    const duongDanHienTai = window.location.pathname;
    const trangHienTai = duongDanHienTai.split('/').pop() || 'index.html';

    let htmlMenu = '';
    menuGroups.forEach(group => {
        htmlMenu += `<div class="nhom-menu-tieu-de">${group.nhom}</div>`;
        htmlMenu += '<ul>';
        group.danhSach.forEach(item => {
            const trangLienKet = item.link.split('/').pop();
            const kichHoat = (duongDanHienTai.includes(item.link) || (trangHienTai !== '' && trangHienTai === trangLienKet)) ? 'kich-hoat' : '';
            const badgeHtml = item.badge ? `<span class="menu-tag-badge">${item.badge}</span>` : '';
            const sosHtml = item.sos ? `<span class="menu-tag-badge canh-bao-sos">SOS</span>` : '';
            htmlMenu += `
                <li>
                    <a href="${item.link}" class="${kichHoat}" title="${item.tieuDe}">
                        <div class="icon-hop-ben">${item.icon}</div>
                        <span class="chu">${item.tieuDe}</span>
                        ${badgeHtml}
                        ${sosHtml}
                    </a>
                </li>
            `;
        });
        htmlMenu += '</ul>';
    });

    sidebar.innerHTML = `
        <div class="tieu-de-phan-he">
            <span id="nhan-phan-he">${tenPhanHe[vaiTro] || 'PHÒNG TRỌ SMART'}</span>
        </div>
        <nav class="danh-sach-menu">
            ${htmlMenu}
        </nav>
        <div class="the-nguoi-dung-thanh-ben">
            <div class="avatar-nguoi-dung-ben">
                <span>${chuCaiDau}</span>
                <span class="cham-online-ben"></span>
            </div>
            <div class="thong-tin-nguoi-dung-ben">
                <div class="ten-nguoi-dung-ben" title="${tenHienThi}">${tenHienThi}</div>
                <div class="vai-tro-nguoi-dung-ben">${vaiTroText}</div>
            </div>
        </div>
    `;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', khoiTaoThanhBen);
} else {
    khoiTaoThanhBen();
}
