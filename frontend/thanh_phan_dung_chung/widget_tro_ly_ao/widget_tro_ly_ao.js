function khoiTaoWidgetChatbot() {
    const nutMo = document.getElementById('nut-mo-chatbot');
    const nutDong = document.getElementById('nut-dong-bot');
    const khungBot = document.getElementById('khung-chat-bot');
    const formGui = document.getElementById('form-gui-bot');
    const inputCauHoi = document.getElementById('nhap-cau-hoi-bot');
    const vungTinNhan = document.getElementById('vung-tin-nhan-bot');

    if (!nutMo || !khungBot) return;

    nutMo.addEventListener('click', () => {
        khungBot.style.display = khungBot.style.display === 'none' ? 'flex' : 'none';
        if (khungBot.style.display === 'flex' && inputCauHoi) {
            inputCauHoi.focus();
        }
    });

    if (nutDong) {
        nutDong.addEventListener('click', () => {
            khungBot.style.display = 'none';
        });
    }

    if (formGui) {
        formGui.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cauHoi = inputCauHoi.value.trim();
            if (!cauHoi) return;

            // Them tin nhan nguoi dung
            const divUser = document.createElement('div');
            divUser.className = 'tin-nhan tin-nhan-user';
            divUser.textContent = cauHoi;
            vungTinNhan.appendChild(divUser);
            inputCauHoi.value = '';
            vungTinNhan.scrollTop = vungTinNhan.scrollHeight;

            // Hien thi dang suy nghi
            const divBot = document.createElement('div');
            divBot.className = 'tin-nhan tin-nhan-bot';
            divBot.innerHTML = '<i>Đang tra cứu câu trả lời...</i>';
            vungTinNhan.appendChild(divBot);
            vungTinNhan.scrollTop = vungTinNhan.scrollHeight;

            try {
                const res = await window.GoiAPI.post('/tro-ly-ao/hoi-dap', { cauHoi, idChu: 2 });
                divBot.innerHTML = res.du_lieu.traLoi;
            } catch (err) {
                divBot.textContent = 'Xin lỗi, trợ lý ảo tạm thời không phản hồi. Vui lòng thử lại!';
            }
            vungTinNhan.scrollTop = vungTinNhan.scrollHeight;
        });
    }
}

document.addEventListener('DOMContentLoaded', khoiTaoWidgetChatbot);
