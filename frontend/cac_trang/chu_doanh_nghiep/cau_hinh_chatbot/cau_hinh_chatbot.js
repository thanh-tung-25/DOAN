let danhSachFAQ = [];

async function taiDanhSachFAQ() {
    try {
        const res = await window.GoiAPI.get('/tro-ly-ao/faq');
        danhSachFAQ = res.du_lieu || [];
        const tbody = document.getElementById('bang-faq');
        if (!tbody) return;

        if (danhSachFAQ.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chưa cấu hình câu hỏi FAQ nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSachFAQ.map(f => {
            const cacTu = f.tu_khoa ? f.tu_khoa.split(',') : [];
            return `
                <tr>
                    <td>#${f.id}</td>
                    <td><strong>${f.cau_hoi}</strong></td>
                    <td>
                        ${cacTu.map(t => `<span class="tu-khoa-tag">${t.trim()}</span>`).join('')}
                    </td>
                    <td><small>${f.cau_tra_loi}</small></td>
                    <td>
                        <button class="nut-phu" onclick="suaFAQ(${f.id})">Sửa</button>
                        <button class="nut-nguy-hiem" onclick="xoaFAQ(${f.id})">Xóa</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải FAQ: ' + loi.message, 'loi');
    }
}

function moModalThemFAQ() {
    document.getElementById('faq-id').value = '';
    document.getElementById('faq-cau-hoi').value = '';
    document.getElementById('faq-tu-khoa').value = '';
    document.getElementById('faq-cau-tra-loi').value = '';
    document.getElementById('tieu-de-modal-faq').textContent = 'Thêm Câu Hỏi FAQ Tự Động Mới';
    document.getElementById('modal-faq').style.display = 'flex';
}

function suaFAQ(id) {
    const f = danhSachFAQ.find(item => item.id === id);
    if (!f) return;
    document.getElementById('faq-id').value = f.id;
    document.getElementById('faq-cau-hoi').value = f.cau_hoi;
    document.getElementById('faq-tu-khoa').value = f.tu_khoa;
    document.getElementById('faq-cau-tra-loi').value = f.cau_tra_loi;
    document.getElementById('tieu-de-modal-faq').textContent = 'Cập Nhật Câu Hỏi FAQ';
    document.getElementById('modal-faq').style.display = 'flex';
}

function dongModalFAQ() {
    document.getElementById('modal-faq').style.display = 'none';
}

async function xuLyLuuFAQ(e) {
    e.preventDefault();
    const id = document.getElementById('faq-id').value;
    const cauHoi = document.getElementById('faq-cau-hoi').value.trim();
    const tuKhoa = document.getElementById('faq-tu-khoa').value.trim();
    const cauTraLoi = document.getElementById('faq-cau-tra-loi').value.trim();

    try {
        await window.GoiAPI.post('/tro-ly-ao/faq', { id, cauHoi, tuKhoa, cauTraLoi });
        window.hienThongBao('Lưu cấu hình FAQ thành công!', 'thanh_cong');
        dongModalFAQ();
        taiDanhSachFAQ();
    } catch (loi) {
        window.hienThongBao('Lỗi lưu FAQ: ' + loi.message, 'loi');
    }
}

async function xoaFAQ(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi FAQ này không?')) return;
    try {
        await window.GoiAPI.delete(`/tro-ly-ao/faq/${id}`);
        window.hienThongBao('Xóa FAQ thành công', 'thanh_cong');
        taiDanhSachFAQ();
    } catch (loi) {
        window.hienThongBao('Lỗi xóa FAQ: ' + loi.message, 'loi');
    }
}

window.moModalThemFAQ = moModalThemFAQ;
window.suaFAQ = suaFAQ;
window.dongModalFAQ = dongModalFAQ;
window.xuLyLuuFAQ = xuLyLuuFAQ;
window.xoaFAQ = xoaFAQ;

document.addEventListener('DOMContentLoaded', taiDanhSachFAQ);
