async function taiMaTranRBAC() {
    try {
        const res = await window.GoiAPI.get('/chu-doanh-nghiep/nhom-quyen');
        const nhomList = res.du_lieu || [];
        const tbody = document.getElementById('bang-ma-tran-nhom');
        if (!tbody) return;

        if (nhomList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có nhóm quyền nào</td></tr>';
            return;
        }

        tbody.innerHTML = nhomList.map(n => {
            const timQuyen = (ma) => {
                const q = (n.chiTiet || []).find(item => item.ma_chuc_nang === ma);
                if (!q) return '<span style="color:#94a3b8;">Không</span>';
                return `
                    <div class="tich-chon-quyen">
                        <span class="${q.quyen_xem ? 'co-quyen' : ''}">Xem</span>
                        <span class="${q.quyen_them ? 'co-quyen' : ''}">Thêm</span>
                        <span class="${q.quyen_sua ? 'co-quyen' : ''}">Sửa</span>
                        <span class="${q.quyen_xoa ? 'co-quyen' : ''}">Xóa</span>
                    </div>
                `;
            };

            return `
                <tr>
                    <td>
                        <strong>${n.ten_nhom}</strong><br>
                        <small style="color:#64748b;">${n.mo_ta || ''}</small>
                    </td>
                    <td>${timQuyen('phong_tro')}</td>
                    <td>${timQuyen('hop_dong')}</td>
                    <td>${timQuyen('hoa_don')}</td>
                    <td>${timQuyen('su_co')}</td>
                    <td>${timQuyen('dien_nuoc')}</td>
                </tr>
            `;
        }).join('');
    } catch (loi) {
        window.hienThongBao('Lỗi tải RBAC: ' + loi.message, 'loi');
    }
}

async function taiAuditLog() {
    try {
        const res = await window.GoiAPI.get('/chu-doanh-nghiep/nhat-ky-audit-log');
        const logs = res.du_lieu || [];
        const timeline = document.getElementById('timeline-audit');
        if (!timeline) return;

        if (logs.length === 0) {
            timeline.innerHTML = '<p style="color:#64748b;">Chưa có nhật ký ghi nhận</p>';
            return;
        }

        timeline.innerHTML = logs.map(l => `
            <div class="item-timeline">
                <div class="dau-item-timeline">
                    <span class="ten-tac-gia">👤 ${l.ho_ten || 'Hệ thống'} (${l.vai_tro || 'System'})</span>
                    <span class="thoi-gian-log">🕒 ${window.DinhDang.ngayGio(l.tao_luc)} | IP: ${l.dia_chi_ip || '127.0.0.1'}</span>
                </div>
                <div class="noi-dung-thao-tac">
                    <strong>Hành động:</strong> ${l.hanh_dong} (Đối tượng: <code>${l.bang_anh_huong} #${l.id_ban_ghi || ''}</code>)
                </div>
            </div>
        `).join('');
    } catch (loi) {
        console.error('Loi audit log:', loi);
    }
}

function chuyenTabRBAC(tab) {
    document.getElementById('tab-rbac').className = tab === 'rbac' ? 'nut-tab kich-hoat' : 'nut-tab';
    document.getElementById('tab-log').className = tab === 'log' ? 'nut-tab kich-hoat' : 'nut-tab';

    document.getElementById('phan-ma-tran-rbac').style.display = tab === 'rbac' ? 'block' : 'none';
    document.getElementById('phan-audit-log').style.display = tab === 'log' ? 'block' : 'none';

    if (tab === 'log') {
        taiAuditLog();
    }
}

window.chuyenTabRBAC = chuyenTabRBAC;

document.addEventListener('DOMContentLoaded', taiMaTranRBAC);
