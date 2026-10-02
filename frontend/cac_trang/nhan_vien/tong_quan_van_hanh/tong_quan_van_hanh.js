async function taiTongQuanNhanVien() {
    try {
        const resPhong = await window.GoiAPI.get('/phong-tro');
        const dsPhong = resPhong.du_lieu || [];
        const phongTrong = dsPhong.filter(p => p.trang_thai === 'con_trong').length;
        document.getElementById('nv-kpi-phong-trong').textContent = phongTrong;

        const resHoaDon = await window.GoiAPI.get('/hoa-don');
        const dsHD = resHoaDon.du_lieu || [];
        const hdTreo = dsHD.filter(h => h.trang_thai !== 'da_thanh_toan').length;
        document.getElementById('nv-kpi-hoa-don-treo').textContent = hdTreo;

        const resSuCo = await window.GoiAPI.get('/su-co');
        const dsSuCo = resSuCo.du_lieu || [];
        const scCho = dsSuCo.filter(s => s.trang_thai !== 'da_hoan_thanh').length;
        document.getElementById('nv-kpi-su-co-cho').textContent = scCho;
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', taiTongQuanNhanVien);
