let amThanhCoiHuContext = null;
let sirenInterval = null;

function phatTiengCoiHu() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        amThanhCoiHuContext = new AudioCtx();

        let tangAm = true;
        let tanSo = 500;

        sirenInterval = setInterval(() => {
            if (!amThanhCoiHuContext) return;
            const osc = amThanhCoiHuContext.createOscillator();
            const gain = amThanhCoiHuContext.createGain();
            osc.type = 'sawtooth';

            if (tangAm) {
                tanSo += 60;
                if (tanSo >= 1100) tangAm = false;
            } else {
                tanSo -= 60;
                if (tanSo <= 500) tangAm = true;
            }

            osc.frequency.setValueAtTime(tanSo, amThanhCoiHuContext.currentTime);
            gain.gain.setValueAtTime(0.15, amThanhCoiHuContext.currentTime);

            osc.connect(gain);
            gain.connect(amThanhCoiHuContext.destination);

            osc.start();
            osc.stop(amThanhCoiHuContext.currentTime + 0.1);
        }, 100);
    } catch (e) {
        console.warn('Không thể phát âm thanh còi:', e);
    }
}

function tatTiengCoiHu() {
    if (sirenInterval) {
        clearInterval(sirenInterval);
        sirenInterval = null;
    }
    if (amThanhCoiHuContext) {
        amThanhCoiHuContext.close();
        amThanhCoiHuContext = null;
    }
}

function kichHoatBaoDongSOS(duLieu) {
    const modal = document.getElementById('hop-thoai-bao-dong-sos');
    const phongEl = document.getElementById('sos-vi-tri-phong');
    const khachEl = document.getElementById('sos-ten-khach');
    const thoiGianEl = document.getElementById('sos-thoi-gian');
    const noiDungEl = document.getElementById('sos-noi-dung');

    if (modal) {
        if (phongEl) phongEl.innerHTML = `Phòng: <strong>${duLieu.maPhong || 'P.101'}</strong>`;
        if (khachEl) khachEl.innerHTML = `Khách thuê: <strong>${duLieu.hoTenKhach || 'Người thuê'}</strong>`;
        if (thoiGianEl) thoiGianEl.innerHTML = `Thời gian: <strong>${duLieu.thoiGian || 'Vừa xong'}</strong>`;
        if (noiDungEl) noiDungEl.innerHTML = `Nội dung: <strong>${duLieu.noiDung || 'Báo động SOS khẩn cấp!'}</strong>`;

        modal.style.display = 'flex';
        phatTiengCoiHu();
    }
}

function khoiTaoModalBaoDong() {
    const nutXacNhan = document.getElementById('nut-xac-nhan-sos');
    const modal = document.getElementById('hop-thoai-bao-dong-sos');

    if (nutXacNhan) {
        nutXacNhan.addEventListener('click', () => {
            tatTiengCoiHu();
            if (modal) modal.style.display = 'none';
        });
    }

    window.kichHoatBaoDongSOS = kichHoatBaoDongSOS;
}

document.addEventListener('DOMContentLoaded', khoiTaoModalBaoDong);
