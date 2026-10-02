function hienThongBao(noiDung, loai = 'thanh_cong') {
    let container = document.getElementById('hop-thong-bao-noi');
    if (!container) {
        container = document.createElement('div');
        container.id = 'hop-thong-bao-noi';
        container.className = 'hop-thong-bao-noi';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `item-toast toast-${loai}`;

    const iconMap = {
        thanh_cong: '✅',
        loi: '❌',
        canh_bao: '⚠️',
        thong_tin: 'ℹ️'
    };

    toast.innerHTML = `
        <span>${iconMap[loai] || 'ℹ️'}</span>
        <span>${noiDung}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

window.hienThongBao = hienThongBao;
