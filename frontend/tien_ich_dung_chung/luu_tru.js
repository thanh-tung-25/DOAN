const LuuTru = {
    layToken() {
        return localStorage.getItem('token_nguoi_dung') || '';
    },
    luuToken(token) {
        localStorage.setItem('token_nguoi_dung', token);
    },
    layNguoiDung() {
        const u = localStorage.getItem('thong_tin_nguoi_dung');
        return u ? JSON.parse(u) : null;
    },
    luuNguoiDung(nguoiDung) {
        localStorage.setItem('thong_tin_nguoi_dung', JSON.stringify(nguoiDung));
    },
    dangXuat() {
        localStorage.removeItem('token_nguoi_dung');
        localStorage.removeItem('thong_tin_nguoi_dung');
        window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html';
    }
};

window.LuuTru = LuuTru;
