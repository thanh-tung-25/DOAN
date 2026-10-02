let boVeCanvas = null;
let idHopDongDangKy = null;

async function taiDanhSachHopDong() {
    try {
        const res = await window.GoiAPI.get('/hop-dong');
        const danhSach = res.du_lieu || [];
        const tbody = document.getElementById('bang-hop-dong');
        if (!tbody) return;

        if (danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Chưa có hợp đồng nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSach.map(hd => {
            const coChuKyChu = !!hd.chu_ky_chu;
            const coChuKyKhach = !!hd.chu_ky_khach;
            const dsOGhep = hd.danhSachOGhep || [];

            return `
                <tr>
                    <td><strong>${hd.ma_hop_dong}</strong></td>
                    <td>
                        <strong>${hd.ma_phong}</strong><br>
                        <small>${hd.ten_khu_tro}</small>
                    </td>
                    <td>
                        <strong>${hd.ten_khach}</strong><br>
                        <small>${hd.sdt_khach}</small>
                    </td>
                    <td>
                        ${dsOGhep.length > 0 ? dsOGhep.map(og => `<small>• ${og.ho_ten} (${og.so_dien_thoai})</small><br>`).join('') : '<small>Không có</small>'}
                    </td>
                    <td>
                        <strong>${window.DinhDang.tienVND(hd.gia_thue)}</strong><br>
                        <small>Cọc: ${window.DinhDang.tienVND(hd.tien_coc)}</small>
                    </td>
                    <td>
                        <small>${window.DinhDang.ngayThang(hd.ngay_bat_dau)}<br>đến ${window.DinhDang.ngayThang(hd.ngay_ket_thuc)}</small>
                    </td>
                    <td><span class="nhan-trang-thai trang-thai-${hd.trang_thai}">${hd.trang_thai}</span></td>
                    <td>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            ${coChuKyChu ? '<span style="color:#10b981; font-size:11px;">✓ Chủ trọ đã ký</span>' : '<button class="nut-phu" style="font-size:11px;" onclick="moModalKyHD(' + hd.id + ', \'chu\')">✍️ Chủ ký</button>'}
                            ${coChuKyKhach ? '<span style="color:#10b981; font-size:11px;">✓ Khách đã ký</span>' : '<span style="color:#f59e0b; font-size:11px;">Chờ khách ký</span>'}
                        </div>
                    </td>
                    <td>
                        <button class="nut-phu" onclick="giaHan1Click(${hd.id})">🔄 Gia hạn 1-Click</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải hợp đồng: ' + loi.message, 'loi');
    }
}

async function moModalLapHopDong() {
    document.getElementById('modal-lap-hd').style.display = 'flex';
    try {
        const resPhong = await window.GoiAPI.get('/phong-tro');
        const dsPhong = resPhong.du_lieu || [];
        const selPhong = document.getElementById('hd-phong');
        if (selPhong) {
            selPhong.innerHTML = dsPhong.map(p => `<option value="${p.id}">${p.ma_phong} - ${p.ten_khu_tro} (${window.DinhDang.tienVND(p.gia_thue)})</option>`).join('');
        }

        const resUsers = await window.GoiAPI.get('/quan-tri/nguoi-dung?vaiTro=khach_thue');
        const dsKhach = resUsers.du_lieu || [];
        const selKhach = document.getElementById('hd-khach');
        if (selKhach) {
            selKhach.innerHTML = dsKhach.map(k => `<option value="${k.id}">${k.ho_ten} (${k.so_dien_thoai})</option>`).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

function dongModalLapHD() {
    document.getElementById('modal-lap-hd').style.display = 'none';
}

async function xuLyLapHD(e) {
    e.preventDefault();
    const idPhong = document.getElementById('hd-phong').value;
    const idKhach = document.getElementById('hd-khach').value;
    const giaThue = document.getElementById('hd-gia-thue').value;
    const tienCoc = document.getElementById('hd-tien-coc').value;
    const ngayBatDau = document.getElementById('hd-ngay-bat-dau').value;
    const ngayKetThuc = document.getElementById('hd-ngay-ket-thuc').value;
    const oGhepRaw = document.getElementById('hd-nguoi-o-ghep').value.trim();

    const danhSachOGhep = [];
    if (oGhepRaw) {
        const parts = oGhepRaw.split('-');
        danhSachOGhep.push({
            hoTen: parts[0] ? parts[0].trim() : oGhepRaw,
            soDienThoai: parts[1] ? parts[1].trim() : '',
            cccd: parts[2] ? parts[2].trim() : ''
        });
    }

    try {
        await window.GoiAPI.post('/hop-dong', {
            idPhong, idKhach, giaThue, tienCoc, ngayBatDau, ngayKetThuc,
            dieuKhoan: 'Thanh toán tiền phòng đúng hạn từ mùng 1 đến mùng 5 hàng tháng. Giữ gìn an ninh trật tự chung.',
            danhSachOGhep
        });
        window.hienThongBao('Khởi tạo hợp đồng thành công!', 'thanh_cong');
        dongModalLapHD();
        taiDanhSachHopDong();
    } catch (loi) {
        window.hienThongBao('Lỗi tạo hợp đồng: ' + loi.message, 'loi');
    }
}

// KY CANVAS
function moModalKyHD(idHopDong, vaiTro) {
    idHopDongDangKy = idHopDong;
    document.getElementById('tieu-de-ky').textContent = `Ký Tên Điện Tử (${vaiTro === 'chu' ? 'Chủ Trọ' : 'Khách Thuê'})`;
    document.getElementById('modal-ky-canvas').style.display = 'flex';

    if (!boVeCanvas) {
        const canvas = document.getElementById('canvas-ky-ten');
        boVeCanvas = new window.BangChuKyCanvas(canvas);
    } else {
        boVeCanvas.xoaChuKy();
    }
}

function dongModalKy() {
    document.getElementById('modal-ky-canvas').style.display = 'none';
}

function xoaNetVe() {
    if (boVeCanvas) boVeCanvas.xoaChuKy();
}

async function xacNhanLuuChuKy() {
    if (!boVeCanvas || !boVeCanvas.coNetVe) {
        alert('Vui lòng ký tên vào khung vẽ trước khi bấm xác nhận!');
        return;
    }

    const chuKyBase64 = boVeCanvas.xuatBase64();
    try {
        await window.GoiAPI.post('/hop-dong/ky-canvas', {
            idHopDong: idHopDongDangKy,
            chuKyCanvas: chuKyBase64,
            vaiTroKy: 'chu'
        });
        window.hienThongBao('Đã lưu chữ ký điện tử vào hợp đồng thành công!', 'thanh_cong');
        dongModalKy();
        taiDanhSachHopDong();
    } catch (loi) {
        window.hienThongBao('Lỗi lưu chữ ký: ' + loi.message, 'loi');
    }
}

async function giaHan1Click(idHopDongCu) {
    if (!confirm('Bạn có chắc chắn muốn kích hoạt Gia hạn 1-Click cho hợp đồng này không?')) return;
    try {
        const res = await window.GoiAPI.post('/hop-dong/gia-han-1-click', { idHopDongCu, soThangGiaHan: 12 });
        window.hienThongBao(`Gia hạn thành công! Mã HĐ mới: ${res.du_lieu.maHopDong}`, 'thanh_cong');
        taiDanhSachHopDong();
    } catch (loi) {
        window.hienThongBao('Lỗi gia hạn: ' + loi.message, 'loi');
    }
}

window.moModalLapHopDong = moModalLapHopDong;
window.dongModalLapHD = dongModalLapHD;
window.xuLyLapHD = xuLyLapHD;
window.moModalKyHD = moModalKyHD;
window.dongModalKy = dongModalKy;
window.xoaNetVe = xoaNetVe;
window.xacNhanLuuChuKy = xacNhanLuuChuKy;
window.giaHan1Click = giaHan1Click;

document.addEventListener('DOMContentLoaded', taiDanhSachHopDong);
