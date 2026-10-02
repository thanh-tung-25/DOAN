const multer = require('multer');
const path = require('path');
const fs = require('fs');

const thuMucLuuTru = path.join(__dirname, '..', 'luu_tru_tep');
if (!fs.existsSync(thuMucLuuTru)) {
    fs.mkdirSync(thuMucLuuTru, { recursive: true });
}

const luuTruDisk = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, thuMucLuuTru);
    },
    filename: function (req, file, cb) {
        const phanMoRong = path.extname(file.originalname);
        const tenDuyNhat = `${Date.now()}_${Math.round(Math.random() * 1E9)}${phanMoRong}`;
        cb(null, tenDuyNhat);
    }
});

const boLocFile = (req, file, cb) => {
    const cacDinhDangChoPhep = /jpeg|jpg|png|webp|pdf/;
    const hopLeExt = cacDinhDangChoPhep.test(path.extname(file.originalname).toLowerCase());
    const hopLeMime = cacDinhDangChoPhep.test(file.mimetype);

    if (hopLeExt && hopLeMime) {
        return cb(null, true);
    }
    cb(new Error('Chỉ cho phép tải lên file định dạng ảnh (jpg, png, webp) hoặc tài liệu PDF!'));
};

const taiLen = multer({
    storage: luuTruDisk,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: boLocFile
});

module.exports = taiLen;
