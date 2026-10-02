const bcrypt = require('bcryptjs');

function bamMatKhau(matKhau) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(matKhau, salt);
}

function soSanhMatKhau(matKhauNhap, matKhauMaHoa) {
    return bcrypt.compareSync(matKhauNhap, matKhauMaHoa);
}

module.exports = {
    bamMatKhau,
    soSanhMatKhau
};
