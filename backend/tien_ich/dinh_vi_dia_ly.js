const https = require('https');

/**
 * Chuyển đổi chuỗi địa chỉ thành tọa độ thực tế (Latitude, Longitude)
 * Sử dụng Nominatim OpenStreetMap Geocoding API với fallback thông minh
 * @param {string} diaChiText - Địa chỉ đầy đủ (VD: Số 10 Yên Nghĩa, Hà Đông, Hà Nội)
 * @returns {Promise<{lat: number, lng: number, tenChinhThuc: string}>}
 */
async function chuyenDiaChiThanhToaDo(diaChiText) {
    const toaDoMacDinh = {
        lat: 10.776889,
        lng: 106.700806,
        tenChinhThuc: 'TP. Hồ Chí Minh, Việt Nam'
    };

    if (!diaChiText || typeof diaChiText !== 'string' || diaChiText.trim().length === 0) {
        return toaDoMacDinh;
    }

    try {
        const diaChiSach = diaChiText.trim();
        const query = encodeURIComponent(`${diaChiSach}, Vietnam`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`;

        const ketQua = await new Promise((resolve) => {
            const req = https.get(url, {
                headers: {
                    'User-Agent': 'SmartRentHouseApp/1.0 (hotro@smartrenthouse.vn)',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
                },
                timeout: 4000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (err) {
                        resolve(null);
                    }
                });
            });

            req.on('error', () => resolve(null));
            req.on('timeout', () => {
                req.destroy();
                resolve(null);
            });
        });

        if (Array.isArray(ketQua) && ketQua.length > 0 && ketQua[0].lat && ketQua[0].lon) {
            return {
                lat: parseFloat(ketQua[0].lat),
                lng: parseFloat(ketQua[0].lon),
                tenChinhThuc: ketQua[0].display_name
            };
        }

        // Thử tìm kiếm với cụm từ rút gọn (Quận Huyện, Tỉnh Thành) nếu chuỗi chi tiết quá dài
        const cacPhan = diaChiSach.split(',').map(s => s.trim()).filter(Boolean);
        if (cacPhan.length > 1) {
            const diaChiRutGon = cacPhan.slice(-2).join(', ');
            const queryRutGon = encodeURIComponent(`${diaChiRutGon}, Vietnam`);
            const urlRutGon = `https://nominatim.openstreetmap.org/search?format=json&q=${queryRutGon}&limit=1`;

            const ketQuaRutGon = await new Promise((resolve) => {
                const req = https.get(urlRutGon, {
                    headers: { 'User-Agent': 'SmartRentHouseApp/1.0 (hotro@smartrenthouse.vn)' },
                    timeout: 3000
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve(null);
                        }
                    });
                });
                req.on('error', () => resolve(null));
                req.on('timeout', () => { req.destroy(); resolve(null); });
            });

            if (Array.isArray(ketQuaRutGon) && ketQuaRutGon.length > 0) {
                return {
                    lat: parseFloat(ketQuaRutGon[0].lat),
                    lng: parseFloat(ketQuaRutGon[0].lon),
                    tenChinhThuc: ketQuaRutGon[0].display_name
                };
            }
        }
    } catch (loi) {
        console.error('[Geocoding] Lỗi định vị địa chỉ:', loi.message);
    }

    return toaDoMacDinh;
}

module.exports = {
    chuyenDiaChiThanhToaDo
};
