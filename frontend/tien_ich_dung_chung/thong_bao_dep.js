/**
 * THƯ VIỆN THÔNG BÁO, XÁC NHẬN VÀ NHẬP LIỆU CHUẨN PRODUCTION
 * Thay thế hoàn toàn alert(), confirm(), prompt() mặc định bằng SweetAlert2 & Toast
 */

(function() {
    // Tự động tải SweetAlert2 từ CDN nếu chưa có
    if (!window.Swal) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(script);
    }

    /**
     * Hiển thị Toast thông báo nổi góc màn hình
     * @param {string} noiDung 
     * @param {'thanh_cong'|'loi'|'canh_bao'|'thong_tin'} loai 
     */
    function hienThongBao(noiDung, loai = 'thanh_cong') {
        const iconSwal = {
            thanh_cong: 'success',
            loi: 'error',
            canh_bao: 'warning',
            thong_tin: 'info'
        }[loai] || 'info';

        if (window.Swal) {
            const Toast = window.Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3500,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', window.Swal.stopTimer);
                    toast.addEventListener('mouseleave', window.Swal.resumeTimer);
                }
            });

            Toast.fire({
                icon: iconSwal,
                title: noiDung
            });
            return;
        }

        // Fallback thuần DOM nếu SweetAlert2 chưa kịp load
        let container = document.getElementById('hop-thong-bao-noi');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hop-thong-bao-noi';
            container.className = 'hop-thong-bao-noi';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `item-toast toast-${loai}`;
        const iconMap = { thanh_cong: '✅', loi: '❌', canh_bao: '⚠️', thong_tin: 'ℹ️' };
        toast.innerHTML = `<span>${iconMap[loai] || 'ℹ️'}</span><span>${noiDung}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    /**
     * Modal xác nhận thay thế confirm()
     * @param {string} tieuDe 
     * @param {string} noiDung 
     * @param {string} nutXacNhanText 
     * @param {string} nutHuyText 
     * @returns {Promise<boolean>}
     */
    async function hienXacNhan(tieuDe, noiDung = '', nutXacNhanText = 'Đồng ý', nutHuyText = 'Hủy bỏ') {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: tieuDe,
                text: noiDung,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#059669',
                cancelButtonColor: '#94a3b8',
                confirmButtonText: nutXacNhanText,
                cancelButtonText: nutHuyText,
                reverseButtons: true
            });
            return res.isConfirmed;
        }
        return window.confirm(`${tieuDe}\n${noiDung}`);
    }

    /**
     * Modal nhập liệu thay thế prompt()
     * @param {string} tieuDe 
     * @param {string} placeholder 
     * @param {string} giaTriMacDinh 
     * @returns {Promise<string|null>}
     */
    async function hienNhapLieu(tieuDe, placeholder = '', giaTriMacDinh = '') {
        if (window.Swal) {
            const res = await window.Swal.fire({
                title: tieuDe,
                input: 'textarea',
                inputPlaceholder: placeholder,
                inputValue: giaTriMacDinh,
                showCancelButton: true,
                confirmButtonColor: '#059669',
                cancelButtonColor: '#94a3b8',
                confirmButtonText: 'Gửi đi',
                cancelButtonText: 'Đóng',
                reverseButtons: true,
                inputValidator: (value) => {
                    if (!value || !value.trim()) {
                        return 'Vui lòng không để trống nội dung!';
                    }
                }
            });
            return res.isConfirmed ? res.value.trim() : null;
        }
        return window.prompt(tieuDe, giaTriMacDinh);
    }

    window.hienThongBao = hienThongBao;
    window.hienXacNhan = hienXacNhan;
    window.hienNhapLieu = hienNhapLieu;

    // Ghi đè window.alert mặc định của trình duyệt để đảm bảo 100% không còn alert() thô sơ
    window.alert = function(thongDiep) {
        if (window.Swal) {
            window.Swal.fire({
                html: `<div style="font-size: 14.5px; color: #1e293b; line-height: 1.6; white-space: pre-line; text-align: left; padding: 6px;">${thongDiep}</div>`,
                icon: 'info',
                confirmButtonColor: '#059669',
                confirmButtonText: 'Đã hiểu'
            });
        } else {
            hienThongBao(String(thongDiep), 'thong_tin');
        }
    };
})();
