const http = require('http');
const fs = require('fs');
const path = require('path');

const CONG = process.env.PORT || 3000;
const THU_MUC_GOC = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
    // Xu ly proxy cho socket.io va luu_tru_tep (anh da tai len) neu frontend goi den cong 3000
    if (req.url.startsWith('/socket.io/') || req.url.startsWith('/luu_tru_tep/')) {
        const proxyReq = http.request({
            hostname: 'localhost',
            port: 5000,
            path: req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });
        proxyReq.on('error', () => {
            res.writeHead(502);
            res.end('Backend server cổng 5000 chưa bật');
        });
        req.pipe(proxyReq, { end: true });
        return;
    }

    let urlPath = decodeURI(req.url.split('?')[0]);
    if (urlPath === '/' || urlPath === '') {
        urlPath = '/index.html';
    }

    const filePath = path.join(THU_MUC_GOC, urlPath);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h1>404 Not Found</h1><p>Không tìm thấy file: ${urlPath}</p>`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

let congHienTai = Number(CONG);

function batDauLangNghe(port) {
    server.listen(port, () => {
        console.log('====================================================');
        console.log(`🌐 GIAO DIỆN FRONTEND ĐÃ KHỞI CHẠY`);
        console.log(`🖥️ Truy cập web tại: http://localhost:${port}`);
        console.log(`📡 Đang kết nối Backend API: http://localhost:5000/api/v1`);
        console.log('====================================================');
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`Cổng ${congHienTai} đang bận, tự động chuyển sang cổng ${congHienTai + 1}...`);
        congHienTai++;
        batDauLangNghe(congHienTai);
    } else {
        console.error('Lỗi máy chủ frontend:', err.message);
    }
});

batDauLangNghe(congHienTai);
