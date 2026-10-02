let socket = null;
let idDoiPhuongHienTai = null;
let thongTinDoiPhuongHienTai = null;
let currentUser = null;
let typingTimeout = null;

function dinhDangGio(isoString) {
    if (!isoString) return 'Vừa xong';
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Vừa xong';
    }
}

function taoLienKetClickable(text) {
    if (!text) return '';
    const safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Biến URL và link nội bộ /cac_trang/... thành thẻ a bấm được
    return safeText.replace(/(\/(cac_trang\/[^\s]+)|https?:\/\/[^\s]+)/g, (url) => {
        return `<a href="${url}" target="_blank" style="color: inherit; text-decoration: underline; font-weight: bold;">${url}</a>`;
    }).replace(/\n/g, '<br>');
}

async function taiDanhSachHoiThoai() {
    try {
        const res = await window.GoiAPI.get('/tin-nhan/danh-sach-hoi-thoai');
        const danhSach = res.du_lieu || [];
        const container = document.getElementById('danh-sach-ban-chat');
        if (!container) return;

        if (danhSach.length === 0) {
            container.innerHTML = `
                <div style="padding: 30px 16px; text-align: center; color: #64748b; font-size: 13px;">
                    Chưa có tin nhắn từ khách thuê.<br>
                    <small>Khi khách liên hệ hoặc đăng ký ở ghép, cuộc trò chuyện sẽ hiển thị tại đây.</small>
                </div>
            `;
            return;
        }

        container.innerHTML = danhSach.map(b => {
            const laDangChon = Number(b.id_doi_phuong) === Number(idDoiPhuongHienTai);
            return `
                <div class="item-nguoi-chat ${laDangChon ? 'kich-hoat' : ''}" onclick="chonHoiThoai(${b.id_doi_phuong}, '${b.ten_doi_phuong || 'Khách thuê'}', '${b.sdt_doi_phuong || ''}')">
                    <div class="avatar-chat">${b.vai_tro_doi_phuong === 'chu_doanh_nghiep' ? '🏢' : '👤'}</div>
                    <div class="thong-tin-chat" style="flex:1; min-width:0;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong style="font-size:14px; color:#0f172a;" class="cat-chu-1">${b.ten_doi_phuong || 'Khách thuê'}</strong>
                            <small style="font-size:11px; color:#94a3b8;">${dinhDangGio(b.thoi_gian_cuoi)}</small>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                            <small class="cat-chu-1" style="color:#64748b; font-size:12px;">${b.tin_nhan_cuoi || 'Hình ảnh...'}</small>
                            ${b.tin_chua_doc > 0 ? `<span style="background:#10b981; color:#fff; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:10px;">${b.tin_chua_doc}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (loi) {
        console.error('Lỗi tải danh sách hội thoại:', loi);
    }
}

async function chonHoiThoai(idDoiPhuong, tenDoiPhuong, sdtDoiPhuong) {
    idDoiPhuongHienTai = Number(idDoiPhuong);
    thongTinDoiPhuongHienTai = { id: idDoiPhuong, ten: tenDoiPhuong, sdt: sdtDoiPhuong };

    const elTen = document.getElementById('ten-nguoi-dang-chat');
    const elSdt = document.getElementById('sdt-nguoi-dang-chat');
    if (elTen) elTen.textContent = tenDoiPhuong || 'Khách thuê';
    if (elSdt) elSdt.textContent = sdtDoiPhuong ? `📞 ${sdtDoiPhuong}` : '';

    // Cập nhật class active ở danh sách hội thoại
    taiDanhSachHoiThoai();

    const vungTin = document.getElementById('vung-tin-nhan-chat');
    if (vungTin) {
        vungTin.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Đang tải lịch sử tin nhắn...</div>';
    }

    try {
        const res = await window.GoiAPI.get(`/tin-nhan/lich-su/${idDoiPhuong}`);
        const data = res.du_lieu || {};
        const tinNhan = data.danh_sach_tin || [];

        if (tinNhan.length === 0) {
            vungTin.innerHTML = `
                <div style="text-align:center; padding:40px; color:#94a3b8; font-size:13px;">
                    Chưa có tin nhắn nào giữa bạn và ${tenDoiPhuong}.<br>Hãy gửi lời phản hồi cho khách thuê!
                </div>
            `;
            return;
        }

        vungTin.innerHTML = tinNhan.map(m => {
            const laNguoiGui = Number(m.id_nguoi_gui) === Number(currentUser.id);
            return `
                <div class="bong-tin-nhan ${laNguoiGui ? 'tin-nhan-gui' : 'tin-nhan-nhan'}">
                    <div>${taoLienKetClickable(m.noi_dung)}</div>
                    <span class="gio-tin">${dinhDangGio(m.tao_luc)}</span>
                </div>
            `;
        }).join('');

        // Tự động scroll mượt mà xuống tin nhắn mới nhất
        vungTin.scrollTop = vungTin.scrollHeight;

        // Báo cho đối phương biết mình đã xem
        if (socket) {
            socket.emit('DA_XEM_TIN_NHAN', { idNguoiGui: idDoiPhuongHienTai, idNguoiNhan: currentUser.id });
        }
    } catch (loi) {
        console.error('Lỗi tải tin nhắn:', loi);
        if (vungTin) vungTin.innerHTML = `<div style="text-align:center; color:#e11d48; padding:20px;">Lỗi tải tin: ${loi.message}</div>`;
    }
}

async function xuLyGuiTin(e) {
    e.preventDefault();
    if (!idDoiPhuongHienTai) {
        window.hienThongBao('Vui lòng chọn một người để gửi tin nhắn!', 'canh_bao');
        return;
    }

    const input = document.getElementById('nhap-tin-nhan');
    const noiDung = input.value.trim();
    if (!noiDung) return;

    input.value = '';

    const vungTin = document.getElementById('vung-tin-nhan-chat');

    // Thêm bong bóng tin nhắn tạm thời lên giao diện ngay lập tức
    const div = document.createElement('div');
    div.className = 'bong-tin-nhan tin-nhan-gui';
    div.innerHTML = `
        <div>${taoLienKetClickable(noiDung)}</div>
        <span class="gio-tin">${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    vungTin.appendChild(div);
    vungTin.scrollTop = vungTin.scrollHeight;

    try {
        // Lưu tin nhắn vào MySQL qua API Backend (Không dùng LocalStorage)
        await window.GoiAPI.post('/tin-nhan/gui', {
            idNguoiNhan: idDoiPhuongHienTai,
            noiDung
        });

        // Phát sự kiện qua Socket.io realtime
        if (socket) {
            socket.emit('GUI_TIN_NHAN', {
                idNguoiGui: currentUser.id,
                idNguoiNhan: idDoiPhuongHienTai,
                noiDung
            });
        }

        // Cập nhật lại danh sách hội thoại
        taiDanhSachHoiThoai();
    } catch (loi) {
        window.hienThongBao('Lỗi gửi tin: ' + loi.message, 'loi');
    }
}

window.chonHoiThoai = chonHoiThoai;
window.xuLyGuiTin = xuLyGuiTin;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = window.LuuTru ? window.LuuTru.layNguoiDung() : null;
    if (!currentUser) {
        window.hienThongBao('Vui lòng đăng nhập tài khoản để xem hộp thư!', 'canh_bao');
        setTimeout(() => window.location.href = '/cac_trang/xac_thuc/dang_nhap/dang_nhap.html', 1200);
        return;
    }

    // Kết nối Socket.io
    socket = window.khoiTaoKetNoiSocket ? window.khoiTaoKetNoiSocket() : null;
    if (socket) {
        socket.emit('DANG_KY_KENH', { idNguoiDung: currentUser.id, vaiTro: currentUser.vai_tro });

        // Lắng nghe nhận tin nhắn realtime từ đối phương
        socket.on('NHAN_TIN_NHAN', (tin) => {
            if (Number(tin.id_nguoi_gui) === Number(idDoiPhuongHienTai)) {
                const vungTin = document.getElementById('vung-tin-nhan-chat');
                if (vungTin) {
                    const div = document.createElement('div');
                    div.className = 'bong-tin-nhan tin-nhan-nhan';
                    div.innerHTML = `
                        <div>${taoLienKetClickable(tin.noi_dung)}</div>
                        <span class="gio-tin">${dinhDangGio(tin.tao_luc)}</span>
                    `;
                    vungTin.appendChild(div);
                    vungTin.scrollTop = vungTin.scrollHeight;
                }
                // Báo đã xem
                socket.emit('DA_XEM_TIN_NHAN', { idNguoiGui: idDoiPhuongHienTai, idNguoiNhan: currentUser.id });
            } else {
                window.hienThongBao(`💬 Tin nhắn mới từ ${tin.ten_nguoi_gui || 'Khách thuê'}: "${tin.noi_dung.substring(0, 40)}..."`, 'thong_tin');
            }
            taiDanhSachHoiThoai();
        });

        // Typing indicator
        socket.on('NGUOI_DUNG_DANG_GO', ({ idNguoiGui }) => {
            if (Number(idNguoiGui) === Number(idDoiPhuongHienTai)) {
                const elTyping = document.getElementById('trang-thai-typing');
                if (elTyping) elTyping.style.display = 'inline';
            }
        });

        socket.on('NGUOI_DUNG_DUNG_GO', ({ idNguoiGui }) => {
            if (Number(idNguoiGui) === Number(idDoiPhuongHienTai)) {
                const elTyping = document.getElementById('trang-thai-typing');
                if (elTyping) elTyping.style.display = 'none';
            }
        });

        const input = document.getElementById('nhap-tin-nhan');
        if (input) {
            input.addEventListener('input', () => {
                if (idDoiPhuongHienTai && socket) {
                    socket.emit('DANG_GO_TIN_NHAN', { idNguoiGui: currentUser.id, idNguoiNhan: idDoiPhuongHienTai });
                    clearTimeout(typingTimeout);
                    typingTimeout = setTimeout(() => {
                        socket.emit('DUNG_GO_TIN_NHAN', { idNguoiGui: currentUser.id, idNguoiNhan: idDoiPhuongHienTai });
                    }, 1500);
                }
            });
        }
    }

    // Tải danh sách các cuộc hội thoại
    await taiDanhSachHoiThoai();

    // Kiểm tra tham số idDoiPhuong trên URL
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('idDoiPhuong');

    if (idParam) {
        chonHoiThoai(Number(idParam), 'Khách thuê', '');
    } else {
        // Tự động mở cuộc trò chuyện đầu tiên nếu có
        try {
            const res = await window.GoiAPI.get('/tin-nhan/danh-sach-hoi-thoai');
            const ds = res.du_lieu || [];
            if (ds.length > 0) {
                chonHoiThoai(ds[0].id_doi_phuong, ds[0].ten_doi_phuong, ds[0].sdt_doi_phuong);
            }
        } catch (e) {}
    }
});
