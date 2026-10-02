let boVeCanvasKhach = null;
let idHopDongKhachKy = null;

async function taiDanhSachHopDongKhach() {
    try {
        const res = await window.GoiAPI.get('/hop-dong');
        const danhSach = res.du_lieu || [];
        const tbody = document.getElementById('bang-hop-dong-khach');
        if (!tbody) return;

        if (danhSach.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Bạn chưa có hợp đồng thuê phòng nào</td></tr>';
            return;
        }

        tbody.innerHTML = danhSach.map(hd => {
            const daKy = !!hd.chu_ky_khach;

            return `
                <tr>
                    <td><strong>${hd.ma_hop_dong}</strong></td>
                    <td>
                        <strong>${hd.ma_phong}</strong><br>
                        <small>${hd.ten_khu_tro}</small>
                    </td>
                    <td>
                        ${hd.ten_chu}<br>
                        <small>${hd.sdt_chu}</small>
                    </td>
                    <td>
                        <strong>${window.DinhDang.tienVND(hd.gia_thue)}</strong><br>
                        <small>Cọc: ${window.DinhDang.tienVND(hd.tien_coc)}</small>
                    </td>
                    <td><small>${window.DinhDang.ngayThang(hd.ngay_bat_dau)} ➔ ${window.DinhDang.ngayThang(hd.ngay_ket_thuc)}</small></td>
                    <td><span class="nhan-trang-thai trang-thai-${hd.trang_thai}">${hd.trang_thai}</span></td>
                    <td>
                        ${daKy ? '<span style="color:#10b981; font-weight:700;">✓ Bạn đã ký số</span>' : '<button class="nut-chinh" style="font-size:11px;" onclick="moModalKyKhach(' + hd.id + ')">✍️ Ký hợp đồng ngay</button>'}
                    </td>
                    <td>
                        <button class="nut-phu" style="font-size:11px;" onclick="alert('Đã tải bản sao PDF hợp đồng!')">📄 Xem PDF</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải hợp đồng: ' + loi.message, 'loi');
    }
}

function moModalKyKhach(idHopDong) {
    idHopDongKhachKy = idHopDong;
    document.getElementById('modal-ky-khach').style.display = 'flex';

    if (!boVeCanvasKhach) {
        const canvas = document.getElementById('canvas-khach-ky');
        boVeCanvasKhach = new window.BangChuKyCanvas(canvas);
    } else {
        boVeCanvasKhach.xoaChuKy();
    }
}

function dongModalKyKhach() {
    document.getElementById('modal-ky-khach').style.display = 'none';
}

function xoaNetVeKhach() {
    if (boVeCanvasKhach) boVeCanvasKhach.xoaChuKy();
}

async function xacNhanLuuChuKyKhach() {
    if (!boVeCanvasKhach || !boVeCanvasKhach.coNetVe) {
        alert('Vui lòng ký nét vẽ tay vào ô trống!');
        return;
    }

    const chuKyBase64 = boVeCanvasKhach.xuatBase64();
    try {
        await window.GoiAPI.post('/hop-dong/ky-canvas', {
            idHopDong: idHopDongKhachKy,
            chuKyCanvas: chuKyBase64,
            vaiTroKy: 'khach'
        });
        window.hienThongBao('Ký tên điện tử thành công! Hợp đồng chính thức có hiệu lực.', 'thanh_cong');
        dongModalKyKhach();
        taiDanhSachHopDongKhach();
    } catch (loi) {
        window.hienThongBao('Lỗi ký hợp đồng: ' + loi.message, 'loi');
    }
}

window.moModalKyKhach = moModalKyKhach;
window.dongModalKyKhach = dongModalKyKhach;
window.xoaNetVeKhach = xoaNetVeKhach;
window.xacNhanLuuChuKyKhach = xacNhanLuuChuKyKhach;

document.addEventListener('DOMContentLoaded', taiDanhSachHopDongKhach);
