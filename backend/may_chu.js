const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const khoiTaoSocket = require('./socket');
const cacTuyenAPI = require('./dieu_tuyen');

const app = express();
const server = http.createServer(app);

// Cau hinh Socket.IO voi CORS day du
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware co ban
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Phuc vu cac file upload (anh, chung tu)
const thuMucLuuTruTep = path.join(__dirname, 'luu_tru_tep');
app.use('/luu_tru_tep', express.static(thuMucLuuTruTep));

// Gan Socket.IO vao req de cac route co the trigger neu can
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Dang ky API
app.use('/api/v1', cacTuyenAPI);

// Thong tin goc backend
app.get('/', (req, res) => {
    res.json({
        he_thong: 'Hệ Thống Quản Lý Phòng Trọ - Backend API',
        phien_ban: '1.0.0',
        trang_thai: 'Hoạt động',
        api_goc: '/api/v1'
    });
});

// Khoi tao kenh thoi gian thuc
khoiTaoSocket(io);

// Xu ly loi he thong tap trung
app.use((err, req, res, next) => {
    console.error('Lỗi hệ thống chưa bắt:', err);
    res.status(500).json({
        thanh_cong: false,
        thong_diep: 'Lỗi máy chủ nội bộ',
        chi_tiet: err.message
    });
});

const CONG_CHAY = process.env.PORT || 5000;

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ CẢNH BÁO: Cổng ${CONG_CHAY} hiện đang bị chiếm bởi một tiến trình Node khác!`);
        console.error(`Vui lòng đóng tiến trình cũ đang chạy cổng ${CONG_CHAY} rồi thử lại.\n`);
    } else {
        console.error('Lỗi máy chủ:', err);
    }
    process.exit(1);
});

server.listen(CONG_CHAY, () => {
    console.log('====================================================');
    console.log(`🚀 BACKEND SERVER (API & Socket.IO) ĐÃ KHỞI CHẠY`);
    console.log(`📡 Địa chỉ API: http://localhost:${CONG_CHAY}/api/v1`);
    console.log(`🔌 Socket.IO: http://localhost:${CONG_CHAY}`);
    console.log(`🗄️ Database: MySQL XAMPP (localhost:3306)`);
    console.log('====================================================');
});
