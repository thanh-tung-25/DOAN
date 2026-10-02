const API_GOC = (window.location.port === '5000') ? '/api/v1' : 'http://localhost:5000/api/v1';

const GoiAPI = {
    async gui(duongDan, tuyChon = {}) {
        const token = window.LuuTru ? window.LuuTru.layToken() : '';
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(tuyChon.headers || {})
        };

        const config = {
            ...tuyChon,
            headers
        };

        try {
            const res = await fetch(`${API_GOC}${duongDan}`, config);
            const data = await res.json();

            if (!res.ok) {
                const err = new Error(data.thong_diep || `Lỗi yêu cầu HTTP ${res.status}`);
                err.status = res.status;
                err.ma_loi = data.ma_loi;
                err.du_lieu = data;

                if (res.status === 401) {
                    console.warn('[API 401] Chưa đăng nhập hoặc phiên làm việc đã hết hạn');
                }
                throw err;
            }
            return data;
        } catch (loi) {
            console.error(`Lỗi gọi API [${duongDan}]:`, loi);
            throw loi;
        }
    },

    get(duongDan, headers = {}) {
        return this.gui(duongDan, { method: 'GET', headers });
    },

    post(duongDan, body, headers = {}) {
        return this.gui(duongDan, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    },

    put(duongDan, body, headers = {}) {
        return this.gui(duongDan, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    },

    delete(duongDan, headers = {}) {
        return this.gui(duongDan, { method: 'DELETE', headers });
    }
};

window.GoiAPI = GoiAPI;
