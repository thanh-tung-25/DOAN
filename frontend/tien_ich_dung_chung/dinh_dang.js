const DinhDang = {
    tienVND(soTien) {
        if (!soTien && soTien !== 0) return '0 đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(soTien));
    },
    ngayThang(chuoiNgay) {
        if (!chuoiNgay) return '';
        const d = new Date(chuoiNgay);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    ngayGio(chuoiNgay) {
        if (!chuoiNgay) return '';
        const d = new Date(chuoiNgay);
        return d.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }
};

window.DinhDang = DinhDang;
