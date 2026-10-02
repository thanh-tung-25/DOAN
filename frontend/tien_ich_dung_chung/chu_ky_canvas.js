class BangChuKyCanvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.dangVe = false;
        this.coNetVe = false;

        this.thietLapNetVe();
        this.ganSuKien();
    }

    thietLapNetVe() {
        this.ctx.strokeStyle = '#1e3a8a'; // Xanh muc but ky dam sang trong
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    ganSuKien() {
        // Chuot
        this.canvas.addEventListener('mousedown', (e) => this.batDauVe(e));
        this.canvas.addEventListener('mousemove', (e) => this.ve(e));
        window.addEventListener('mouseup', () => this.dungVe());

        // Cam ung (Mobile / Tablet)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.batDauVe(e.touches[0]);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.ve(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchend', () => this.dungVe());
    }

    layToaDo(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    batDauVe(e) {
        this.dangVe = true;
        this.coNetVe = true;
        const { x, y } = this.layToaDo(e);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    ve(e) {
        if (!this.dangVe) return;
        const { x, y } = this.layToaDo(e);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    dungVe() {
        this.dangVe = false;
    }

    xoaChuKy() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.coNetVe = false;
    }

    xuatBase64() {
        if (!this.coNetVe) return null;
        return this.canvas.toDataURL('image/png');
    }
}

window.BangChuKyCanvas = BangChuKyCanvas;
