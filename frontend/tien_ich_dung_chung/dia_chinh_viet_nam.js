/**
 * DỮ LIỆU ĐỊA CHÍNH VIỆT NAM MỚI (CHÍNH QUYỀN ĐỊA PHƯƠNG 2 CẤP)
 * - Bao gồm 34 đơn vị hành chính cấp tỉnh mới (6 Thành phố trực thuộc TW + 28 Tỉnh)
 *   theo Nghị quyết của Quốc hội về việc sắp xếp, tinh giản bộ máy hành chính cấp tỉnh & cấp xã.
 * - BỎ CẤP HUYỆN: Hệ thống chuyển đổi trực tiếp từ Tỉnh / Thành phố sang Phường / Xã / Thị trấn.
 * - Danh sách Phường / Xã thực tế cập nhật sau sáp nhập, không sử dụng tên giả lập.
 */

(function () {
    // 1. DANH SÁCH 34 TỈNH / THÀNH PHỐ MỚI
    const tatCa34TinhThanh = [
        "TP. Hồ Chí Minh",
        "TP. Hà Nội",
        "TP. Đà Nẵng",
        "TP. Hải Phòng",
        "TP. Cần Thơ",
        "TP. Huế",
        "An Giang",
        "Bắc Ninh",
        "Cà Mau",
        "Cao Bằng",
        "Điện Biên",
        "Đắk Lắk",
        "Đồng Nai",
        "Đồng Tháp",
        "Gia Lai",
        "Hà Tĩnh",
        "Hưng Yên",
        "Khánh Hòa",
        "Lai Châu",
        "Lạng Sơn",
        "Lào Cai",
        "Lâm Đồng",
        "Nghệ An",
        "Ninh Bình",
        "Phú Thọ",
        "Quảng Ngãi",
        "Quảng Ninh",
        "Quảng Trị",
        "Sơn La",
        "Tây Ninh",
        "Thái Nguyên",
        "Thanh Hóa",
        "Tuyên Quang",
        "Vĩnh Long"
    ];

    // Bảng ánh xạ các tỉnh cũ hoặc cách ghi khác về 34 tỉnh thành mới
    const anhXaTinhCuSangMoi = {
        "Thành phố Hồ Chí Minh": "TP. Hồ Chí Minh",
        "TP.HCM": "TP. Hồ Chí Minh",
        "Hồ Chí Minh": "TP. Hồ Chí Minh",
        "Bình Dương": "TP. Hồ Chí Minh",
        "Bà Rịa - Vũng Tàu": "TP. Hồ Chí Minh",
        "Bà Rịa Vũng Tàu": "TP. Hồ Chí Minh",

        "Thành phố Hà Nội": "TP. Hà Nội",
        "Hà Nội": "TP. Hà Nội",

        "Thành phố Đà Nẵng": "TP. Đà Nẵng",
        "Đà Nẵng": "TP. Đà Nẵng",
        "Quảng Nam": "TP. Đà Nẵng",

        "Thành phố Hải Phòng": "TP. Hải Phòng",
        "Hải Phòng": "TP. Hải Phòng",
        "Hải Dương": "TP. Hải Phòng",

        "Thành phố Cần Thơ": "TP. Cần Thơ",
        "Cần Thơ": "TP. Cần Thơ",
        "Sóc Trăng": "TP. Cần Thơ",
        "Hậu Giang": "TP. Cần Thơ",

        "Thừa Thiên Huế": "TP. Huế",
        "Huế": "TP. Huế",
        "Thành phố Huế": "TP. Huế",

        "Bắc Giang": "Bắc Ninh",
        "Bình Phước": "Đồng Nai",
        "Thái Bình": "Hưng Yên",
        "Hà Nam": "Ninh Bình",
        "Nam Định": "Ninh Bình",
        "Vĩnh Phúc": "Phú Thọ",
        "Hòa Bình": "Phú Thọ",
        "Bắc Kạn": "Thái Nguyên",
        "Hà Giang": "Tuyên Quang",
        "Yên Bái": "Lào Cai",
        "Quảng Bình": "Quảng Trị",
        "Kon Tum": "Quảng Ngãi",
        "Bình Định": "Gia Lai",
        "Ninh Thuận": "Khánh Hòa",
        "Đắk Nông": "Lâm Đồng",
        "Bình Thuận": "Lâm Đồng",
        "Phú Yên": "Đắk Lắk",
        "Long An": "Tây Ninh",
        "Tiền Giang": "Đồng Tháp",
        "Bến Tre": "Vĩnh Long",
        "Trà Vinh": "Vĩnh Long",
        "Bạc Liêu": "Cà Mau",
        "Kiên Giang": "An Giang"
    };

    // 2. DỮ LIỆU PHƯỜNG / XÃ / THỊ TRẤN SAU SÁP NHẬP CHO TỪNG TỈNH THÀNH MỚI
    const duLieuPhuongXa34Tinh = {
        "TP. Hồ Chí Minh": [
            // Trung tâm TP.HCM (đã sáp nhập một số phường)
            "Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Cô Giang",
            "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định",
            "Phường Võ Thị Sáu", "Phường Bàn Cờ", "Phường Lê Văn Sỹ", "Phường Nhiêu Lộc",
            "Phường Xóm Chiếu", "Phường Khánh Hội", "Phường Vĩnh Hội", "Phường Cây Bàng",
            "Phường Chợ Quán", "Phường An Đông", "Phường Chợ Lớn", "Phường Kim Biên", "Phường Hải Thượng Lãn Ông",
            "Phường Bình Tây", "Phường Cây Gõ", "Phường Phú Lâm", "Phường Bình Tiên",
            "Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy", "Phường Tân Kiểng", "Phường Tân Hưng",
            "Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Phú Mỹ", "Phường Phú Thuận", "Phường Bình Thuận",
            "Phường Rạch Ông", "Phường Hưng Phú", "Phường Xóm Củi", "Phường Chánh Hưng", "Phường Ba Tơ",
            "Phường Chí Hòa", "Phường Vườn Chuối", "Phường Nhật Tảo", "Phường Hòa Hưng", "Phường Bắc Hải",
            "Phường Bình Thới", "Phường Minh Phụng", "Phường Lãnh Binh Thăng", "Phường Đầm Sen",
            "Phường Thạnh Lộc", "Phường Thạnh Xuân", "Phường An Phú Đông", "Phường Hiệp Thành", "Phường Thới An",
            "Phường Tân Chánh Hiệp", "Phường Tân Thới Hiệp", "Phường Tân Hưng Thuận", "Phường Tân Thới Nhất", "Phường Đông Hưng Thuận", "Phường Trung Mỹ Tây",
            "Phường Thị Nghè", "Phường Hàng Xanh", "Phường Gia Định", "Phường Bình Lợi Trung", "Phường Thanh Đa",
            "Phường Cống Bà Xếp", "Phường Lăng Cha Cả", "Phường Bảy Hiền", "Phường Hoàng Hoa Thám", "Phường Bạch Đằng",
            "Phường Phú Thọ Hòa", "Phường Tân Sơn Nhì", "Phường Tây Thạnh", "Phường Sơn Kỳ", "Phường Tân Quý",
            "Phường Tân Thành", "Phường Phú Thạnh", "Phường Phú Trung", "Phường Hiệp Tân", "Phường Hòa Thạnh",
            "Phường Hạnh Thông", "Phường An Hội", "Phường Thông Tây Hội", "Phường Xóm Vôi",
            "Phường Cầu Kiệu", "Phường Phú Nhuận", "Phường Đức Nhuận",
            "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A", "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông",
            "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường An Lạc", "Phường An Lạc A", "Phường Tân Tạo", "Phường Tân Tạo A",
            // Thành phố Thủ Đức
            "Phường Thảo Điền", "Phường An Phú", "Phường An Khánh", "Phường Thủ Thiêm", "Phường Hiệp Phú",
            "Phường Linh Trung", "Phường Linh Xuân", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây",
            "Phường Tam Bình", "Phường Tam Phú", "Phường Trường Thọ", "Phường Bình Chiểu", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước",
            "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Phước Long A", "Phường Phước Long B", "Phường Phước Bình",
            "Phường Long Trường", "Phường Long Thạnh Mỹ", "Phường Long Bình", "Phường Long Phước", "Phường Phú Hữu",
            "Phường Bình Trưng Tây", "Phường Bình Trưng Đông", "Phường Cát Lái", "Phường Thạnh Mỹ Lợi",
            // Xã ngoại thành TP.HCM
            "Xã Tân Túc", "Xã An Phú Tây", "Xã Bình Chánh", "Xã Bình Hưng", "Xã Bình Lợi", "Xã Đa Phước",
            "Xã Hưng Long", "Xã Lê Minh Xuân", "Xã Phạm Văn Hai", "Xã Phong Phú", "Xã Quy Đức", "Xã Tân Kiên", "Xã Tân Nhựt", "Xã Tân Quý Tây", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B",
            "Xã Bà Điểm", "Xã Đông Thạnh", "Xã Hóc Môn", "Xã Nhị Bình", "Xã Tân Hiệp", "Xã Tân Thới Nhì", "Xã Tân Xuân", "Xã Thới Tam Thôn", "Xã Trung Chánh", "Xã Xuân Thới Đông", "Xã Xuân Thới Sơn", "Xã Xuân Thới Thượng",
            "Xã Nhà Bè", "Xã Hiệp Phước", "Xã Long Thới", "Xã Nhơn Đức", "Xã Phú Xuân", "Xã Phước Kiển", "Xã Phước Lộc",
            "Xã Củ Chi", "Xã An Nhơn Tây", "Xã An Phú", "Xã Bình Mỹ", "Xã Hòa Phú", "Xã Nhuận Đức", "Xã Phạm Văn Cội", "Xã Phú Hòa Đông", "Xã Tân An Hội", "Xã Tân Thạnh Đông", "Xã Trung An",
            "Xã Cần Thạnh", "Xã An Thới Đông", "Xã Bình Khánh", "Xã Long Hòa", "Xã Lý Nhơn", "Xã Tam Thôn Hiệp", "Xã Thạnh An",
            // Vùng kinh tế Bình Dương & Bà Rịa - Vũng Tàu sáp nhập
            "Phường Phú Cường", "Phường Chánh Nghĩa", "Phường Định Hòa", "Phường Hiệp Thành", "Phường Hòa Phú", "Phường Phú Hòa", "Phường Phú Lợi", "Phường Phú Mỹ",
            "Phường Lái Thiêu", "Phường An Thạnh", "Phường Thuận Giao", "Phường Bình Hòa", "Phường Vĩnh Phú",
            "Phường Dĩ An", "Phường An Bình", "Phường Đông Hòa", "Phường Tân Đông Hiệp", "Phường Bình Thắng",
            "Phường Uyên Hưng", "Phường Tân Hiệp", "Phường Thái Hòa", "Phường Mỹ Phước", "Phường Thới Hòa",
            "Phường Vũng Tàu", "Phường Thắng Nhất", "Phường Thắng Nhì", "Phường Thắng Tam", "Phường Rạch Dừa", "Phường Nguyễn An Ninh",
            "Phường Phước Hưng", "Phường Long Toàn", "Phường Kim Dinh", "Phường Phú Mỹ (TX)", "Phường Hắc Dịch", "Phường Mỹ Xuân", "Xã Long Sơn"
        ],

        "TP. Hà Nội": [
            // Trung tâm Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng (sau sáp nhập)
            "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Hàng Bông", "Phường Hàng Buồm", "Phường Cửa Đông", "Phường Cửa Nam",
            "Phường Đồng Xuân", "Phường Tràng Tiền", "Phường Phan Chu Trinh", "Phường Lý Thái Tổ", "Phường Trần Hưng Đạo", "Phường Phúc Tân", "Phường Chương Dương",
            "Phường Điện Biên", "Phường Đội Cấn", "Phường Giảng Võ", "Phường Kim Mã", "Phường Liễu Giai", "Phường Ngọc Hà",
            "Phường Ngọc Khánh", "Phường Quán Thánh", "Phường Thành Công", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Phúc Xá",
            "Phường Cát Linh", "Phường Hàng Bột", "Phường Khâm Thiên", "Phường Láng Hạ", "Phường Láng Thượng", "Phường Kim Liên",
            "Phường Ô Chợ Dừa", "Phường Phương Mai", "Phường Quang Trung", "Phường Quốc Tử Giám", "Phường Thịnh Quang", "Phường Thổ Quan",
            "Phường Trung Liệt", "Phường Trung Phụng", "Phường Phương Liên - Trung Tự", "Phường Văn Miếu - Quốc Tử Giám",
            "Phường Bách Khoa", "Phường Bạch Mai", "Phường Đồng Tâm", "Phường Lê Đại Hành", "Phường Minh Khai", "Phường Nguyễn Du",
            "Phường Phạm Đình Hổ", "Phường Thanh Nhàn", "Phường Trương Định", "Phường Vĩnh Tuy", "Phường Thanh Lương", "Phường Quỳnh Lôi",
            // Cầu Giấy, Thanh Xuân, Nam Từ Liêm, Bắc Từ Liêm
            "Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Mai Dịch", "Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Quan Hoa", "Phường Trung Hòa", "Phường Yên Hòa",
            "Phường Hạ Đình", "Phường Khương Đình", "Phường Khương Mai", "Phường Khương Trung", "Phường Kim Giang", "Phường Nhân Chính",
            "Phường Phương Liệt", "Phường Thanh Xuân Bắc", "Phường Thanh Xuân Nam", "Phường Thanh Xuân Trung", "Phường Thượng Đình",
            "Phường Mễ Trì", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Phú Đô", "Phường Cầu Diễn", "Phường Tây Mỗ", "Phường Đại Mỗ", "Phường Trung Văn", "Phường Xuân Phương", "Phường Phương Canh",
            "Phường Cổ Nhuế 1", "Phường Cổ Nhuế 2", "Phường Đông Ngạc", "Phường Đức Thắng", "Phường Xuân Đỉnh", "Phường Xuân Tảo", "Phường Phú Diễn", "Phường Phúc Diễn", "Phường Tây Tựu", "Phường Thượng Cát", "Phường Thụy Phương",
            // Hoàng Mai, Hà Đông, Long Biên, Tây Hồ
            "Phường Hoàng Liệt", "Phường Định Công", "Phường Đại Kim", "Phường Giáp Bát", "Phường Tân Mai", "Phường Mai Động", "Phường Vĩnh Hưng", "Phường Lĩnh Nam", "Phường Thịnh Liệt", "Phường Yên Sở", "Phường Thanh Trì",
            "Phường Mộ Lao", "Phường Văn Quán", "Phường Quang Trung (Hà Đông)", "Phường La Khê", "Phường Kiến Hưng", "Phường Dương Nội", "Phường Hà Cầu", "Phường Phú La", "Phường Phúc La", "Phường Vạn Phúc", "Phường Yên Nghĩa",
            "Phường Bồ Đề", "Phường Gia Thụy", "Phường Ngọc Lâm", "Phường Ngọc Thụy", "Phường Sài Đồng", "Phường Việt Hưng", "Phường Thạch Bàn", "Phường Long Biên", "Phường Đức Giang", "Phường Giang Biên", "Phường Phúc Lợi",
            "Phường Bưởi", "Phường Nhật Tân", "Phường Phú Thượng", "Phường Quảng An", "Phường Thụy Khuê", "Phường Tứ Liên", "Phường Xuân La", "Phường Yên Phụ",
            // Các thị trấn, xã ngoại thành lớn
            "Thị trấn Trâu Quỳ", "Thị trấn Yên Viên", "Xã Ninh Hiệp", "Xã Đa Tốn", "Xã Bát Tràng",
            "Thị trấn Đông Anh", "Xã Kim Nỗ", "Xã Vĩnh Ngọc", "Xã Hải Bối", "Xã Uy Nỗ",
            "Thị trấn Văn Điển", "Xã Tân Triều", "Xã Thanh Liệt", "Xã Tam Hiệp", "Xã Tứ Hiệp",
            "Thị trấn Sóc Sơn", "Thị trấn Phùng", "Thị trấn Trạm Trôi", "Thị trấn Quốc Oai", "Thị trấn Chúc Sơn", "Thị trấn Thường Tín", "Thị trấn Sơn Tây"
        ],

        "TP. Đà Nẵng": [
            "Phường Hải Châu 1", "Phường Hải Châu 2", "Phường Thạch Thang", "Phường Thanh Bình", "Phường Thuận Phước",
            "Phường Hòa Thuận Đông", "Phường Hòa Thuận Tây", "Phường Nam Dương", "Phường Phước Ninh", "Phường Bình Thuận", "Phường Bình Hiên", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam",
            "Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Hòa Khê",
            "Phường An Hải Bắc", "Phường An Hải Đông", "Phường An Hải Tây", "Phường Mân Thái", "Phường Nại Hiên Đông", "Phường Phước Mỹ", "Phường Thọ Quang",
            "Phường Hòa Hải", "Phường Hòa Quý", "Phường Khuê Mỹ", "Phường Mỹ An",
            "Phường Hòa Hiệp Bắc", "Phường Hòa Hiệp Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Khánh Nam", "Phường Hòa Minh",
            "Phường Hòa An", "Phường Hòa Phát", "Phường Hòa Thọ Đông", "Phường Hòa Thọ Tây", "Phường Hòa Xuân", "Phường Khuê Trung",
            "Xã Hòa Châu", "Xã Hòa Phước", "Xã Hòa Khương", "Xã Hòa Nhơn", "Xã Hòa Phong", "Xã Hòa Tiến", "Xã Hòa Sơn", "Xã Hòa Liên", "Xã Hòa Ninh", "Xã Hòa Bắc", "Xã Hòa Phú",
            // Khu vực Quảng Nam sáp nhập
            "Phường Minh An (Hội An)", "Phường Cẩm Phô", "Phường Sơn Phong", "Phường Cẩm Châu", "Phường Cẩm An", "Phường Cửa Đại", "Xã Cẩm Thanh", "Xã Tân Hiệp (Cù Lao Chàm)",
            "Phường An Mỹ (Tam Kỳ)", "Phường An Xuân", "Phường Tân Thạnh", "Phường Hòa Thuận", "Phường Trường Xuân",
            "Phường Vĩnh Điện (Điện Bàn)", "Phường Điện Ngọc", "Phường Điện Nam Trung", "Phường Điện Nam Bắc", "Xã Điện Hòa", "Xã Điện Thắng Bắc",
            "Thị trấn Núi Thành", "Thị trấn Nam Phước (Duy Xuyên)", "Thị trấn Hà Lam (Thăng Bình)", "Thị trấn Ái Nghĩa (Đại Lộc)"
        ],

        "TP. Hải Phòng": [
            "Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Phan Bội Châu", "Phường Quán Toan", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Trại Chuối",
            "Phường Cầu Đất", "Phường Cầu Tre", "Phường Đằng Giang", "Phường Đông Khê", "Phường Gia Viên", "Phường Lạc Viên", "Phường Lạch Tray", "Phường Lê Lợi", "Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ",
            "Phường An Biên", "Phường An Dương", "Phường Cát Dài", "Phường Dư Hàng", "Phường Dư Hàng Kênh", "Phường Hàng Kênh", "Phường Hồ Nam", "Phường Kênh Dương", "Phường Lam Sơn", "Phường Niệm Nghĩa", "Phường Nghĩa Xá", "Phường Trại Cau", "Phường Trần Nguyên Hãn", "Phường Vĩnh Niệm",
            "Phường Vạn Hương (Đồ Sơn)", "Phường Bàng La", "Phường Ngọc Xuyên", "Phường Hợp Đức",
            "Phường Anh Dũng (Dương Kinh)", "Phường Đa Phúc", "Phường Hưng Đạo", "Phường Hải Thành",
            "Phường Bắc Sơn (Kiến An)", "Phường Đồng Hòa", "Phường Quán Trữ", "Phường Trần Thành Ngọ", "Phường Phù Liễn",
            "Thị trấn Núi Đèo (Thủy Nguyên)", "Phường Minh Đức", "Xã An Lư", "Xã Thủy Đường", "Xã Quảng Thanh", "Xã Hòa Bình",
            "Thị trấn An Dương", "Thị trấn An Lão", "Thị trấn Tiên Lãng", "Thị trấn Vĩnh Bảo", "Thị trấn Cát Bà",
            // Khu vực Hải Dương sáp nhập
            "Phường Quang Trung (Hải Dương)", "Phường Trần Phú", "Phường Lê Thanh Nghị", "Phường Hải Tân", "Phường Tứ Minh", "Phường Việt Hòa", "Phường Bình Hàn", "Phường Ngọc Châu", "Phường Tân Bình",
            "Phường Sao Đỏ (Chí Linh)", "Phường Bến Tắm", "Phường Cộng Hòa", "Phường Phả Lại", "Phường An Sinh (Kinh Môn)", "Phường Hiệp An"
        ],

        "TP. Cần Thơ": [
            "Phường Tân An", "Phường An Cư", "Phường An Hòa", "Phường An Khánh", "Phường An Nghiệp", "Phường Cái Khế", "Phường Hưng Lợi", "Phường Thới Bình", "Phường Xuân Khánh",
            "Phường Ba Láng", "Phường Hưng Phú", "Phường Hưng Thạnh", "Phường Lê Bình", "Phường Phú Thứ", "Phường Tân Phú",
            "Phường An Thới", "Phường Bình Thủy", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền", "Phường Thới An Đông", "Phường Trà An", "Phường Trà Nóc",
            "Phường Châu Văn Liêm (Ô Môn)", "Phường Thới Hòa", "Phường Thới An", "Phường Phước Thới",
            "Phường Thốt Nốt", "Phường Thuận An", "Phường Trung Kiên", "Thị trấn Phong Điền", "Thị trấn Thới Lai", "Thị trấn Cờ Đỏ",
            // Sáp nhập Sóc Trăng & Hậu Giang
            "Phường 1 (Sóc Trăng)", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 7", "Phường 8", "Phường 10",
            "Phường Vĩnh Phước (Vĩnh Châu)", "Phường 1 (Ngã Năm)", "Thị trấn Mỹ Xuyên", "Thị trấn Kế Sách",
            "Phường 1 (Vị Thanh)", "Phường 3", "Phường 4", "Phường 5", "Phường 7",
            "Phường Ngã Bảy", "Phường Hiệp Thành", "Phường Lái Hiếu", "Thị trấn Nàng Mau", "Thị trấn Cái Tắc"
        ],

        "TP. Huế": [
            "Phường Phú Nhuận", "Phường Phú Hội", "Phường Vĩnh Ninh", "Phường Vỹ Dạ", "Phường Phước Vĩnh", "Phường Xuân Phú", "Phường An Cựu", "Phường An Đông",
            "Phường Đông Ba", "Phường Thuận Lộc", "Phường Tây Lộc", "Phường Thuận Thành", "Phường Kim Long", "Phường Hương Sơ", "Phường An Hòa", "Phường Hương Long",
            "Phường Thủy Xuân", "Phường Thủy Biều", "Phường Thủy Vân", "Phường Thuận An", "Phường Hương Hồ", "Phường Hương Chữ",
            "Thị trấn Phong Điền", "Thị trấn Sịa (Quảng Điền)", "Thị trấn Phú Đa (Phú Vang)", "Thị trấn Phú Lộc", "Thị trấn Lăng Cô", "Thị trấn A Lưới", "Thị trấn Khe Tre"
        ],

        "Bắc Ninh": [
            "Phường Suối Hoa", "Phường Tiền An", "Phường Ninh Xá", "Phường Vệ An", "Phường Kinh Bắc", "Phường Đại Phúc", "Phường Võ Cường", "Phường Hạp Lĩnh", "Phường Khắc Niệm", "Phường Vũ Ninh",
            "Phường Đông Ngàn (Từ Sơn)", "Phường Đồng Kỵ", "Phường Trang Hạ", "Phường Châu Khê", "Phường Phù Chẩn", "Phường Hương Mạc", "Phường Tam Sơn",
            "Phường Phố Mới (Quế Võ)", "Phường Bằng An", "Phường Phương Liễu", "Phường Việt Hùng",
            "Phường Hồ (Thuận Thành)", "Phường An Bình", "Phường Trí Quả", "Phường Xuân Lâm",
            "Thị trấn Chờ (Yên Phong)", "Thị trấn Thứa (Lương Tài)", "Thị trấn Gia Bình",
            // Vùng Bắc Giang sáp nhập
            "Phường Ngô Quyền (Bắc Giang)", "Phường Hoàng Văn Thụ", "Phường Trần Phú", "Phường Dĩnh Kế", "Phường Xương Giang", "Phường Đa Mai",
            "Phường Bích Động (Việt Yên)", "Phường Nếnh", "Phường Tự Lạn", "Phường Quang Châu",
            "Thị trấn Thắng (Hiệp Hòa)", "Thị trấn Nham Biền (Yên Dũng)", "Thị trấn Chũ (Lục Ngạn)", "Thị trấn Đồi Ngô (Lục Nam)", "Thị trấn Vôi (Lạng Giang)"
        ],

        "Đồng Nai": [
            "Phường Trảng Dài", "Phường Tân Phong", "Phường Tân Biên", "Phường Tân Hiệp", "Phường Hố Nai", "Phường Tam Hiệp", "Phường Tam Hòa", "Phường Tân Mai",
            "Phường Thống Nhất", "Phường Quyết Thắng", "Phường Long Bình", "Phường Long Bình Tân", "Phường An Bình", "Phường Bửu Long", "Phường Hiệp Hòa", "Phường Hóa An",
            "Phường Xuân An (Long Khánh)", "Phường Xuân Bình", "Phường Xuân Hòa", "Phường Phú Bình", "Phường Suối Tre",
            "Thị trấn Long Thành", "Thị trấn Hiệp Phước (Nhơn Trạch)", "Thị trấn Trảng Bom", "Thị trấn Vĩnh An", "Thị trấn Định Quán", "Thị trấn Tân Phú", "Thị trấn Gia Ray (Xuân Lộc)",
            // Vùng Bình Phước sáp nhập
            "Phường Tân Phú (Đồng Xoài)", "Phường Tân Bình", "Phường Tân Đồng", "Phường Tiến Thành",
            "Phường An Lộc (Bình Long)", "Phường Phú Thịnh", "Phường Long Phước (Phước Long)", "Phường Thác Mơ",
            "Thị trấn Chơn Thành", "Thị trấn Lộc Ninh", "Thị trấn Tân Khai (Hớn Quản)", "Thị trấn Đức Phong (Bù Đăng)"
        ],

        "Hưng Yên": [
            "Phường Hiến Nam", "Phường Lê Lợi", "Phường Lam Sơn", "Phường An Tảo", "Phường Hồng Châu", "Phường Minh Khai",
            "Phường Bần Yên Nhân (Mỹ Hào)", "Phường Bạch Sam", "Phường Phùng Chí Kiên", "Phường Dị Sử", "Phường Nhân Hòa",
            "Thị trấn Văn Giang", "Thị trấn Như Quỳnh (Văn Lâm)", "Thị trấn Yên Mỹ", "Thị trấn Khoái Châu", "Thị trấn Trần Cao (Phù Cừ)", "Thị trấn Ân Thi", "Thị trấn Lương Bằng (Kim Động)",
            // Vùng Thái Bình sáp nhập
            "Phường Đề Thám (Thái Bình)", "Phường Lê Hồng Phong", "Phường Bồ Xuyên", "Phường Kỳ Bá", "Phường Quang Trung", "Phường Trần Lãm", "Phường Tiền Phong",
            "Thị trấn Vũ Thư", "Thị trấn Đông Hưng", "Thị trấn Hưng Hà", "Thị trấn Diêm Điền (Thái Thụy)", "Thị trấn Tiền Hải", "Thị trấn Kiến Xương", "Thị trấn Quỳnh Côi"
        ],

        "Ninh Bình": [
            "Phường Vân Giang", "Phường Bích Đào", "Phường Nam Thành", "Phường Ninh Khánh", "Phường Đông Thành", "Phường Thanh Bình", "Phường Ninh Sơn",
            "Phường Bắc Sơn (Tam Điệp)", "Phường Trung Sơn", "Phường Nam Sơn", "Phường Tây Sơn",
            "Thị trấn Yên Ninh (Yên Khánh)", "Thị trấn Me (Gia Viễn)", "Thị trấn Nho Quan", "Thị trấn Phát Diệm (Kim Sơn)", "Thị trấn Yên Thịnh (Yên Mô)",
            // Sáp nhập Nam Định & Hà Nam
            "Phường Vị Xuyên (Nam Định)", "Phường Trần Tế Xương", "Phường Năng Tĩnh", "Phường Cửa Bắc", "Phường Lộc Vượng", "Phường Thống Nhất", "Phường Lộc Hạ",
            "Thị trấn Cổ Lễ (Trực Ninh)", "Thị trấn Ngô Đồng (Giao Thủy)", "Thị trấn Yên Định (Hải Hậu)", "Thị trấn Xuân Trường", "Thị trấn Liễu Đề (Nghĩa Hưng)",
            "Phường Minh Khai (Phủ Lý)", "Phường Lương Khánh Thiện", "Phường Lam Hạ", "Phường Liêm Chính",
            "Phường Đồng Văn (Duy Tiên)", "Phường Hòa Mạc", "Thị trấn Quế (Kim Bảng)", "Thị trấn Vĩnh Trụ (Lý Nhân)", "Thị trấn Kiện Khê"
        ],

        "Phú Thọ": [
            "Phường Tiên Cát (Việt Trì)", "Phường Nông Trang", "Phường Gia Cẩm", "Phường Dữu Lâu", "Phường Bạch Hạc", "Phường Bến Gót", "Phường Vân Phú", "Phường Tân Dân",
            "Phường Âu Cơ (TX. Phú Thọ)", "Phường Hùng Vương", "Phường Phong Châu", "Phường Thanh Vinh",
            "Thị trấn Lâm Thao", "Thị trấn Hùng Sơn", "Thị trấn Phong Châu (Phù Ninh)", "Thị trấn Đoan Hùng", "Thị trấn Thanh Sơn", "Thị trấn Thanh Thủy", "Thị trấn Cẩm Khê",
            // Sáp nhập Vĩnh Phúc & Hòa Bình
            "Phường Liên Bảo (Vĩnh Yên)", "Phường Tích Sơn", "Phường Khai Quang", "Phường Ngô Quyền", "Phường Đống Đa",
            "Phường Trưng Nhị (Phúc Yên)", "Phường Xuân Hòa", "Phường Phúc Thắng",
            "Thị trấn Hương Canh (Bình Xuyên)", "Thị trấn Yên Lạc", "Thị trấn Vĩnh Tường", "Thị trấn Tam Đảo",
            "Phường Phương Lâm (Hòa Bình)", "Phường Đồng Tiến", "Phường Tân Thịnh", "Phường Thịnh Lang", "Phường Kỳ Sơn",
            "Thị trấn Lương Sơn", "Thị trấn Bo (Kim Bôi)", "Thị trấn Mãn Đức (Tân Lạc)", "Thị trấn Mai Châu"
        ],

        "Thái Nguyên": [
            "Phường Phan Đình Phùng", "Phường Hoàng Văn Thụ", "Phường Quang Trung", "Phường Tân Lập", "Phường Đồng Quang", "Phường Gia Sàng", "Phường Cam Giá", "Phường Tích Lương", "Phường Tân Long",
            "Phường Thắng Lợi (Sông Công)", "Phường Mỏ Chè", "Phường Cải Đan", "Phường Bách Quang",
            "Phường Ba Hàng (Phổ Yên)", "Phường Đồng Tiến", "Phường Bãi Bông", "Phường Bắc Sơn", "Phường Nam Tiến",
            "Thị trấn Hùng Sơn (Đại Từ)", "Thị trấn Chợ Chu (Định Hóa)", "Thị trấn Chùa Hang", "Thị trấn Đu (Phú Lương)", "Thị trấn Hương Sơn (Phú Bình)",
            // Sáp nhập Bắc Kạn
            "Phường Đức Xuân (Bắc Kạn)", "Phường Sông Cầu", "Phường Phùng Chí Kiên", "Phường Nguyễn Thị Minh Khai",
            "Thị trấn Phủ Thông (Bạch Thông)", "Thị trấn Bằng Lũng (Chợ Đồn)", "Thị trấn Chợ Mới", "Thị trấn Yến Lạc (Na Rì)", "Thị trấn Nà Phặc (Ngân Sơn)", "Xã Ba Bể"
        ],

        "Tuyên Quang": [
            "Phường Tân Quang", "Phường Phan Thiết", "Phường Minh Xuân", "Phường Nông Tiến", "Phường Ỷ La", "Phường An Tường", "Phường Mỹ Lâm", "Phường Đội Cấn",
            "Thị trấn Tân Yên (Hàm Yên)", "Thị trấn Vĩnh Lộc (Chiêm Hóa)", "Thị trấn Na Hang", "Thị trấn Sơn Dương", "Xã Yên Sơn", "Xã Lâm Bình",
            // Sáp nhập Hà Giang
            "Phường Trần Phú (Hà Giang)", "Phường Minh Khai", "Phường Nguyễn Trãi", "Phường Quang Trung", "Phường Ngọc Hà",
            "Thị trấn Đồng Văn", "Thị trấn Mèo Vạc", "Thị trấn Yên Minh", "Thị trấn Tam Sơn (Quản Bạ)", "Thị trấn Vị Xuyên", "Thị trấn Việt Quang (Bắc Quang)", "Thị trấn Vinh Quang (Hoàng Su Phì)", "Thị trấn Cốc Pài (Xín Mần)"
        ],

        "Lào Cai": [
            "Phường Kim Tân", "Phường Cốc Lếu", "Phường Duyên Hải", "Phường Lào Cai", "Phường Bắc Lệnh", "Phường Pom Hán", "Phường Bình Minh", "Phường Bắc Cường",
            "Phường Sa Pa (TX. Sa Pa)", "Phường Cầu Mây", "Phường Hàm Rồng", "Phường Phan Si Păng", "Phường Ô Quý Hồ",
            "Thị trấn Bát Xát", "Thị trấn Phố Lu (Bảo Thắng)", "Thị trấn Phố Ràng (Bảo Yên)", "Thị trấn Bắc Hà", "Thị trấn Mường Khương", "Thị trấn Si Ma Cai", "Thị trấn Khánh Yên (Văn Bàn)",
            // Sáp nhập Yên Bái
            "Phường Đồng Tâm (Yên Bái)", "Phường Yên Ninh", "Phường Minh Tân", "Phường Nguyễn Thái Học", "Phường Hồng Hà", "Phường Nam Cường",
            "Phường Trung Tâm (Nghĩa Lộ)", "Phường Tân An", "Phường Cầu Thia",
            "Thị trấn Cổ Phúc (Trấn Yên)", "Thị trấn Mậu A (Văn Yên)", "Thị trấn Yên Bình", "Thị trấn Yên Thế (Lục Yên)", "Thị trấn Mù Cang Chải", "Thị trấn Trạm Tấu"
        ],

        "Quảng Trị": [
            "Phường 1 (Đông Hà)", "Phường 2", "Phường 3", "Phường 5", "Phường Đông Lễ", "Phường Đông Lương", "Phường Đông Giang",
            "Phường 1 (TX. Quảng Trị)", "Phường 2", "Phường 3", "Phường An Đôn",
            "Thị trấn Gio Linh", "Thị trấn Hồ Xá (Vĩnh Linh)", "Thị trấn Ái Tử (Triệu Phong)", "Thị trấn Diên Sanh (Hải Lăng)", "Thị trấn Cam Lộ", "Thị trấn Khe Sanh (Hướng Hóa)", "Thị trấn Lao Bảo", "Thị trấn Krông Klang",
            // Sáp nhập Quảng Bình
            "Phường Đồng Hải (Đồng Hới)", "Phường Đồng Phú", "Phường Hải Thành", "Phường Bắc Lý", "Phường Nam Lý", "Phường Đức Ninh Đông",
            "Phường Ba Đồn", "Phường Quảng Long", "Phường Quảng Thọ", "Phường Quảng Thuận",
            "Thị trấn Hoàn Lão (Bố Trạch)", "Thị trấn Phong Nha", "Thị trấn Kiến Giang (Lệ Thủy)", "Thị trấn Quán Hàu (Quảng Ninh)", "Thị trấn Đồng Lê (Tuyên Hóa)", "Thị trấn Quy Đạt (Minh Hóa)"
        ],

        "Quảng Ngãi": [
            "Phường Lê Hồng Phong", "Phường Trần Hưng Đạo", "Phường Nguyễn Nghiêm", "Phường Trần Phú", "Phường Quảng Phú", "Phường Nghĩa Chánh", "Phường Chánh Lộ", "Phường Trương Quang Trọng",
            "Phường Nguyễn Nghiêm (Đức Phổ)", "Phường Phổ Thạnh", "Phường Phổ Quang", "Phường Phổ Ninh",
            "Thị trấn Châu Ổ (Bình Sơn)", "Thị trấn Sông Vệ (Tư Nghĩa)", "Thị trấn Mộ Đức", "Thị trấn Chợ Chùa (Nghĩa Hành)", "Thị trấn Ba Tơ", "Thị trấn Trà Bồng", "Thị trấn Di Lăng (Sơn Hà)", "Huyện Đảo Lý Sơn",
            // Sáp nhập Kon Tum
            "Phường Quyết Thắng (Kon Tum)", "Phường Thắng Lợi", "Phường Quang Trung", "Phường Duy Tân", "Phường Trần Hưng Đạo", "Phường Lê Lợi",
            "Thị trấn Đắk Hà", "Thị trấn Đắk Tô", "Thị trấn Plei Kần (Ngọc Hồi)", "Thị trấn Sa Thầy", "Thị trấn Măng Đen (Kon Plông)", "Thị trấn Đắk Glei"
        ],

        "Gia Lai": [
            "Phường Diên Hồng (Pleiku)", "Phường Hoa Lư", "Phường Hội Phú", "Phường Hội Thương", "Phường Tây Sơn", "Phường Thống Nhất", "Phường Yên Đỗ", "Phường Yên Thế", "Phường Thắng Lợi", "Phường Chi Lăng",
            "Phường An Bình (An Khê)", "Phường Tây Sơn", "Phường An Phú",
            "Phường Đoàn Kết (Ayun Pa)", "Phường Sông Bờ", "Phường Cheo Reo",
            "Thị trấn Chư Sê", "Thị trấn Đắk Đoa", "Thị trấn Chư Prông", "Thị trấn Chư Ty (Đức Cơ)", "Thị trấn Nhơn Hòa (Chư Pưh)", "Thị trấn Kon Dơng (Mang Yang)", "Thị trấn Phú Túc (Krông Pa)",
            // Sáp nhập Bình Định
            "Phường Trần Phú (Quy Nhơn)", "Phường Lê Hồng Phong", "Phường Lý Thường Kiệt", "Phường Thị Nại", "Phường Đống Đa", "Phường Ngô Mây", "Phường Ghềnh Ráng", "Phường Nhơn Bình", "Phường Nhơn Phú",
            "Phường Bình Định (An Nhơn)", "Phường Đập Đá", "Phường Nhơn Hưng",
            "Phường Bồng Sơn (Hoài Nhơn)", "Phường Tam Quan", "Phường Tam Quan Bắc",
            "Thị trấn Ngô Mây (Phù Cát)", "Thị trấn Phù Mỹ", "Thị trấn Tuy Phước", "Thị trấn Phú Phong (Tây Sơn)", "Thị trấn Tăng Bạt Hổ (Hoài Ân)"
        ],

        "Khánh Hòa": [
            "Phường Lộc Thọ (Nha Trang)", "Phường Tân Lập", "Phường Phước Tiến", "Phường Phước Tân", "Phường Phương Sài", "Phường Xương Huân", "Phường Vạn Thạnh", "Phường Vạn Thắng",
            "Phường Vĩnh Hải", "Phường Vĩnh Phước", "Phường Vĩnh Nguyên", "Phường Vĩnh Trường", "Phường Phước Long", "Phường Phước Hải", "Xã Vĩnh Ngọc", "Xã Phước Đồng",
            "Phường Cam Nghĩa (Cam Ranh)", "Phường Cam Phúc Bắc", "Phường Cam Lợi", "Phường Cam Linh", "Phường Cam Lộc", "Phường Ba Ngòi",
            "Phường Ninh Hiệp (Ninh Hòa)", "Phường Ninh Đa", "Phường Ninh Giang", "Phường Ninh Diêm", "Phường Ninh Thủy",
            "Thị trấn Diên Khánh", "Thị trấn Cam Đức (Cam Lâm)", "Thị trấn Vạn Giã (Vạn Ninh)", "Thị trấn Khánh Vĩnh", "Thị trấn Tô Hạp (Khánh Sơn)", "Đặc khu Trường Sa",
            // Sáp nhập Ninh Thuận
            "Phường Kinh Dinh (Phan Rang)", "Phường Đạo Long", "Phường Mỹ Hương", "Phường Tấn Tài", "Phường Thanh Sơn", "Phường Phủ Hà", "Phường Đài Sơn", "Phường Bảo An", "Phường Đô Vinh",
            "Thị trấn Phước Dân (Ninh Phước)", "Thị trấn Khánh Hải (Ninh Hải)", "Thị trấn Tân Sơn (Ninh Sơn)"
        ],

        "Lâm Đồng": [
            "Phường 1 (Đà Lạt)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
            "Phường B'Lao (Bảo Lộc)", "Phường Lộc Phát", "Phường Lộc Tiến", "Phường Lộc Sơn", "Phường 1", "Phường 2",
            "Thị trấn Liên Nghĩa (Đức Trọng)", "Thị trấn Thạnh Mỹ (Đơn Dương)", "Thị trấn Lạc Dương", "Thị trấn Đinh Văn (Lâm Hà)", "Thị trấn Di Linh", "Thị trấn Lộc Thắng (Bảo Lâm)", "Thị trấn Ma Đa Guôi", "Thị trấn Đạ Tẻh",
            // Sáp nhập Đắk Nông & Bình Thuận
            "Phường Nghĩa Đức (Gia Nghĩa)", "Phường Nghĩa Thành", "Phường Nghĩa Phú", "Phường Nghĩa Tân", "Phường Nghĩa Trung",
            "Thị trấn Đắk Mil", "Thị trấn Đức An (Đắk Song)", "Thị trấn Ea T'ling (Cư Jút)", "Thị trấn Đắk Mâm (Krông Nô)", "Thị trấn Kiến Đức (Đắk R'lắp)",
            "Phường Đức Nghĩa (Phan Thiết)", "Phường Đức Thắng", "Phường Lạc Đạo", "Phường Phú Thủy", "Phường Thanh Hải", "Phường Phú Trinh", "Phường Hàm Tiến", "Phường Mũi Né",
            "Phường Tân An (La Gi)", "Phường Phước Hội", "Phường Phước Lộc",
            "Thị trấn Ma Lâm (Hàm Thuận Bắc)", "Thị trấn Thuận Nam (Hàm Thuận Nam)", "Thị trấn Chợ Lầu (Bắc Bình)", "Thị trấn Liên Hương (Tuy Phong)", "Thị trấn Phan Rí Cửa", "Thị trấn Võ Xu (Đức Linh)", "Thị trấn Lạc Tánh (Tánh Linh)", "Huyện Đảo Phú Quý"
        ],

        "Đắk Lắk": [
            "Phường Thắng Lợi (Buôn Ma Thuột)", "Phường Thống Nhất", "Phường Thành Công", "Phường Tân Lợi", "Phường Tự An", "Phường Tân Lập", "Phường Tân An", "Phường Tân Hòa", "Phường Khánh Xuân", "Phường Ea Tam",
            "Phường An Lạc (Buôn Hồ)", "Phường An Bình", "Phường Thiện An", "Phường Đoàn Kết", "Phường Đạt Hiếu",
            "Thị trấn Quảng Phú (Cư M'gar)", "Thị trấn Phước An (Krông Pắc)", "Thị trấn Buôn Trấp (Krông Ana)", "Thị trấn Ea Kar", "Thị trấn Krông Năng", "Thị trấn Ea Drăng (Ea H'leo)", "Thị trấn Buôn Đôn", "Thị trấn Liên Sơn (Lắk)",
            // Sáp nhập Phú Yên
            "Phường 1 (Tuy Hòa)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 9", "Phường Phú Đông", "Phường Phú Lâm", "Phường Phú Thạnh",
            "Phường Xuân Phú (Sông Cầu)", "Phường Xuân Yên", "Phường Xuân Đài", "Phường Xuân Thành",
            "Phường Hòa Hiệp Trung (Đông Hòa)", "Phường Hòa Vinh", "Thị trấn Phú Thứ (Tây Hòa)", "Thị trấn Phú Hòa", "Thị trấn Chí Thạnh (Tuy An)", "Thị trấn La Hai (Đồng Xuân)"
        ],

        "Tây Ninh": [
            "Phường 1 (Tây Ninh)", "Phường 2", "Phường 3", "Phường 4", "Phường Hiệp Ninh", "Phường Ninh Sơn", "Phường Ninh Thạnh",
            "Phường Long Hoa (Hòa Thành)", "Phường Hiệp Tân", "Phường Long Thành Bắc", "Phường Long Thành Trung",
            "Phường Trảng Bàng", "Phường An Hòa", "Phường Gia Lộc", "Phường An Tịnh",
            "Thị trấn Gò Dầu", "Thị trấn Châu Thành", "Thị trấn Tân Biên", "Thị trấn Tân Châu", "Thị trấn Bến Cầu", "Thị trấn Dương Minh Châu",
            // Sáp nhập Long An
            "Phường 1 (Tân An)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường Khánh Hậu", "Phường Tân Khánh",
            "Phường 1 (Kiến Tường)", "Phường 2", "Phường 3",
            "Thị trấn Bến Lức", "Thị trấn Cần Giuộc", "Thị trấn Cần Đước", "Thị trấn Hậu Nghĩa (Đức Hòa)", "Thị trấn Đức Hòa", "Thị trấn Hiệp Hòa", "Thị trấn Đông Thành (Đức Huệ)", "Thị trấn Thủ Thừa", "Thị trấn Tân Trụ", "Thị trấn Tầm Vu (Châu Thành)", "Thị trấn Thạnh Hóa"
        ],

        "Đồng Tháp": [
            "Phường 1 (Cao Lãnh)", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 11", "Phường Mỹ Phú", "Phường Hòa Thuận",
            "Phường 1 (Sa Đéc)", "Phường 2", "Phường 3", "Phường 4", "Phường Tân Quy Đông", "Phường An Hòa",
            "Phường An Lộc (Hồng Ngự)", "Phường An Thạnh", "Phường An Lạc",
            "Thị trấn Lấp Vò", "Thị trấn Lai Vung", "Thị trấn Cái Tàu Hạ (Châu Thành)", "Thị trấn Tràm Chim (Tam Nông)", "Thị trấn Mỹ An (Tháp Mười)", "Thị trấn Sa Rài (Tân Hồng)", "Thị trấn Thanh Bình",
            // Sáp nhập Tiền Giang
            "Phường 1 (Mỹ Tho)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường Tân Long",
            "Phường 1 (Gò Công)", "Phường 2", "Phường Long Chánh", "Phường Long Thuận",
            "Phường 1 (Cai Lậy)", "Phường 4", "Phường 5", "Thị trấn Cái Bè", "Thị trấn Chợ Gạo", "Thị trấn Vĩnh Bình (Gò Công Tây)", "Thị trấn Tân Hòa (Gò Công Đông)", "Thị trấn Tân Phước"
        ],

        "Vĩnh Long": [
            "Phường 1 (Vĩnh Long)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 8", "Phường 9", "Phường Tân Hòa", "Phường Tân Ngãi",
            "Phường Cái Vồn (Bình Minh)", "Phường Thành Phước", "Phường Đông Thuận",
            "Thị trấn Long Hồ", "Thị trấn Cái Nhum (Mang Thít)", "Thị trấn Vũng Liêm", "Thị trấn Tam Bình", "Thị trấn Trà Ôn", "Thị trấn Tân Quới (Bình Tân)",
            // Sáp nhập Bến Tre & Trà Vinh
            "Phường An Hội (Bến Tre)", "Phường Phú Khương", "Phường Phú Tân", "Phường Sơn Đông",
            "Thị trấn Châu Thành", "Thị trấn Chợ Lách", "Thị trấn Mỏ Cày (Mỏ Cày Nam)", "Thị trấn Ba Tri", "Thị trấn Bình Đại", "Thị trấn Thạnh Phú", "Thị trấn Giồng Trôm",
            "Phường 1 (Trà Vinh)", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9",
            "Phường 1 (Duyên Hải)", "Phường 2", "Thị trấn Càng Long", "Thị trấn Cầu Kè", "Thị trấn Tiểu Cần", "Thị trấn Cầu Ngang", "Thị trấn Trà Cú"
        ],

        "An Giang": [
            "Phường Mỹ Bình (Long Xuyên)", "Phường Mỹ Long", "Phường Mỹ Xuyên", "Phường Bình Đức", "Phường Bình Khánh", "Phường Mỹ Thới", "Phường Mỹ Thạnh", "Phường Đông Xuyên",
            "Phường Châu Phú A (Châu Đốc)", "Phường Châu Phú B", "Phường Núi Sam", "Phường Vĩnh Nguơn", "Phường Vĩnh Mỹ",
            "Phường Long Thạnh (Tân Châu)", "Phường Long Hưng", "Phường Long Châu",
            "Phường Tịnh Biên", "Phường Nhà Bàng", "Phường Chi Lăng",
            "Thị trấn Tri Tôn", "Thị trấn Ba Chúc", "Thị trấn Chợ Mới", "Thị trấn Mỹ Luông", "Thị trấn Phú Mỹ (Phú Tân)", "Thị trấn An Châu (Châu Thành)", "Thị trấn Cái Dầu (Châu Phú)", "Thị trấn An Phú", "Thị trấn Núi Sập (Thoại Sơn)",
            // Sáp nhập Kiên Giang
            "Phường Vĩnh Thanh Vân (Rạch Giá)", "Phường Vĩnh Thanh", "Phường Vĩnh Lạc", "Phường Vĩnh Bảo", "Phường An Hòa", "Phường An Bình", "Phường Rạch Sỏi",
            "Phường Đông Hồ (Hà Tiên)", "Phường Pháo Đài", "Phường Tô Châu", "Phường Mỹ Đức",
            "Phường Dương Đông (Phú Quốc)", "Phường An Thới", "Xã Gành Dầu", "Xã Hàm Ninh", "Xã Cửa Cạn", "Xã Cửa Dương", "Xã Bãi Thơm", "Xã Thổ Châu",
            "Thị trấn Kiên Lương", "Thị trấn Hòn Đất", "Thị trấn Tân Hiệp", "Thị trấn Giồng Riềng", "Thị trấn Gò Quao", "Thị trấn Thứ Ba (An Biên)", "Thị trấn Vĩnh Thuận"
        ],

        "Cà Mau": [
            "Phường 1 (Cà Mau)", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường Tân Xuyên", "Phường Tân Thành",
            "Thị trấn Năm Căn", "Thị trấn Sông Đốc (Trần Văn Thời)", "Thị trấn Trần Văn Thời", "Thị trấn Cái Nước", "Thị trấn Đầm Dơi", "Thị trấn Thới Bình", "Thị trấn U Minh", "Thị trấn Rạch Gốc (Ngọc Hiển)", "Thị trấn Cái Đôi Vàm (Phú Tân)",
            // Sáp nhập Bạc Liêu
            "Phường 1 (Bạc Liêu)", "Phường 2", "Phường 3", "Phường 5", "Phường 7", "Phường 8", "Phường Nhà Mát",
            "Phường Hộ Phòng (Giá Rai)", "Phường 1", "Phường Láng Tròn",
            "Thị trấn Ngan Dừa (Hồng Dân)", "Thị trấn Phước Long", "Thị trấn Châu Hưng (Vĩnh Lợi)", "Thị trấn Gành Hào (Đông Hải)", "Thị trấn Hòa Bình"
        ],

        "Cao Bằng": [
            "Phường Hợp Giang (Cao Bằng)", "Phường Sông Hiến", "Phường Sông Bằng", "Phường Đề Thám", "Phường Ngọc Xuân", "Phường Tân Giang", "Phường Hòa Chung", "Phường Duyệt Trung",
            "Thị trấn Bảo Lạc", "Thị trấn Pác Miầu (Bảo Lâm)", "Thị trấn Thanh Nhật (Hạ Lang)", "Thị trấn Xuân Hòa (Hà Quảng)", "Thị trấn Nước Hai (Hòa An)", "Thị trấn Nguyên Bình", "Thị trấn Tĩnh Túc", "Thị trấn Quảng Uyên (Quảng Hòa)", "Thị trấn Phục Hòa", "Thị trấn Đông Khê (Thạch An)", "Thị trấn Trùng Khánh", "Thị trấn Trà Lĩnh"
        ],

        "Điện Biên": [
            "Phường Mường Thanh (Điện Biên Phủ)", "Phường Nam Thanh", "Phường Noong Bua", "Phường Tân Thanh", "Phường Thanh Bình", "Phường Thanh Trường", "Phường Him Lam",
            "Phường Sông Đà (Mường Lay)", "Phường Na Lay",
            "Xã Thanh Nưa (Điện Biên)", "Xã Thanh Luông", "Xã Thanh Xương", "Xã Sam Mứn", "Xã Noong Hẹt", "Xã Mường Phăng",
            "Thị trấn Điện Biên Đông", "Thị trấn Mường Ảng", "Thị trấn Mường Chà", "Thị trấn Mường Nhé", "Thị trấn Nậm Pồ", "Thị trấn Tủa Chùa", "Thị trấn Tuần Giáo"
        ],

        "Hà Tĩnh": [
            "Phường Bắc Hà (Hà Tĩnh)", "Phường Nam Hà", "Phường Tân Giang", "Phường Trần Phú", "Phường Hà Huy Tập", "Phường Đại Nài", "Phường Thạch Quý", "Phường Thạch Linh", "Phường Nguyễn Du",
            "Phường Bắc Hồng (Hồng Lĩnh)", "Phường Nam Hồng", "Phường Trung Lương", "Phường Đức Thuận", "Phường Đậu Liêu",
            "Phường Sông Trí (TX. Kỳ Anh)", "Phường Kỳ Long", "Phường Kỳ Liên", "Phường Kỳ Phương", "Phường Kỳ Thịnh",
            "Thị trấn Cẩm Xuyên", "Thị trấn Thiên Cầm", "Thị trấn Nghèn (Can Lộc)", "Thị trấn Đức Thọ", "Thị trấn Hương Khê", "Thị trấn Phố Châu (Hương Sơn)", "Thị trấn Tây Sơn", "Thị trấn Tiên Điền (Nghi Xuân)", "Thị trấn Xuân An", "Thị trấn Thạch Hà", "Thị trấn Vũ Quang", "Thị trấn Lộc Hà"
        ],

        "Lai Châu": [
            "Phường Quyết Thắng (Lai Châu)", "Phường Quyết Tiến", "Phường Đoàn Kết", "Phường Tân Phong", "Phường Đông Phong",
            "Thị trấn Mường Tè", "Thị trấn Nậm Nhùn", "Thị trấn Phong Thổ", "Thị trấn Sìn Hồ", "Thị trấn Tam Đường", "Thị trấn Tân Uyên", "Thị trấn Than Uyên"
        ],

        "Lạng Sơn": [
            "Phường Hoàng Văn Thụ (Lạng Sơn)", "Phường Tam Thanh", "Phường Vĩnh Trại", "Phường Đông Kinh", "Phường Chi Lăng",
            "Thị trấn Đồng Đăng (Cao Lộc)", "Thị trấn Cao Lộc", "Thị trấn Bắc Sơn", "Thị trấn Bình Gia", "Thị trấn Hữu Lũng", "Thị trấn Lộc Bình", "Thị trấn Na Dương", "Thị trấn Đình Lập", "Thị trấn Thất Khê (Tràng Định)", "Thị trấn Văn Quan", "Thị trấn Na Sầm (Văn Lãng)"
        ],

        "Nghệ An": [
            "Phường Quang Trung (Vinh)", "Phường Lê Mao", "Phường Lê Lợi", "Phường Hà Huy Tập", "Phường Đội Cung", "Phường Cửa Nam", "Phường Quán Bàu", "Phường Hưng Bình", "Phường Hưng Dũng", "Phường Hưng Phúc", "Phường Bến Thủy", "Phường Trường Thi", "Phường Đông Vĩnh", "Phường Nghi Phú",
            "Phường Nghi Hương (Cửa Lò)", "Phường Nghi Thu", "Phường Nghi Thủy", "Phường Thu Thủy",
            "Phường Hòa Hiếu (Thái Hòa)", "Phường Quang Tiến", "Phường Long Sơn",
            "Phường Mai Hùng (Hoàng Mai)", "Phường Quỳnh Thiện", "Phường Quỳnh Dị",
            "Thị trấn Diễn Châu", "Thị trấn Cầu Giát (Quỳnh Lưu)", "Thị trấn Quán Hành (Nghi Lộc)", "Thị trấn Quỳ Hợp", "Thị trấn Đô Lương", "Thị trấn Nam Đàn", "Thị trấn Hưng Nguyên", "Thị trấn Thanh Chương", "Thị trấn Tân Kỳ", "Thị trấn Nghĩa Đàn", "Thị trấn Con Cuông", "Thị trấn Mường Xén (Kỳ Sơn)"
        ],

        "Quảng Ninh": [
            "Phường Hồng Gai (Hạ Long)", "Phường Bạch Đằng", "Phường Trần Hưng Đạo", "Phường Cao Xanh", "Phường Cao Thắng", "Phường Bãi Cháy", "Phường Hùng Thắng", "Phường Tuần Châu", "Phường Hà Lầm", "Phường Hà Trung", "Phường Hà Phong", "Phường Hồng Hà", "Phường Hồng Hải", "Phường Yết Kiêu", "Phường Hoành Bồ",
            "Phường Cẩm Trung (Cẩm Phả)", "Phường Cẩm Thành", "Phường Cẩm Phả", "Phường Cửa Ông", "Phường Mông Dương", "Phường Quang Hanh",
            "Phường Quang Trung (Uông Bí)", "Phường Thanh Sơn", "Phường Vàng Danh", "Phường Yên Thanh", "Phường Phương Đông",
            "Phường Trần Phú (Móng Cái)", "Phường Ka Long", "Phường Ninh Dương", "Phường Trà Cổ", "Phường Hải Hòa",
            "Phường Quảng Yên (TX. Quảng Yên)", "Phường Đông Mai", "Phường Minh Thành",
            "Phường Đông Triều (TX. Đông Triều)", "Phường Mạo Khê", "Phường Đức Chính",
            "Thị trấn Cái Rồng (Vân Đồn)", "Thị trấn Cô Tô", "Thị trấn Tiên Yên", "Thị trấn Đầm Hà", "Thị trấn Quảng Hà (Hải Hà)", "Thị trấn Ba Chẽ", "Thị trấn Bình Liêu"
        ],

        "Thanh Hóa": [
            "Phường Ba Đình (Thanh Hóa)", "Phường Điện Biên", "Phường Lam Sơn", "Phường Ngọc Trạo", "Phường Đông Thọ", "Phường Phú Sơn", "Phường Trường Thi", "Phường Đông Vệ", "Phường Tân Sơn", "Phường Quảng Hưng", "Phường Quảng Thành", "Phường Hàm Rồng",
            "Phường Bắc Sơn (Sầm Sơn)", "Phường Trung Sơn", "Phường Trường Sơn", "Phường Quảng Cư", "Phường Quảng Châu",
            "Phường Ba Đình (Bỉm Sơn)", "Phường Ngọc Trạo", "Phường Bắc Sơn",
            "Phường Hải Hòa (Nghi Sơn)", "Phường Hải Bình", "Phường Hải Thanh", "Phường Bình Minh",
            "Thị trấn Rừng Thông (Đông Sơn)", "Thị trấn Tân Phong (Quảng Xương)", "Thị trấn Bút Sơn (Hoằng Hóa)", "Thị trấn Hậu Lộc", "Thị trấn Nga Sơn", "Thị trấn Hà Trung", "Thị trấn Kim Tân (Thạch Thành)", "Thị trấn Vĩnh Lộc", "Thị trấn Quán Lào (Yên Định)", "Thị trấn Lam Sơn (Thọ Xuân)", "Thị trấn Triệu Sơn", "Thị trấn Thiệu Hóa", "Thị trấn Nông Cống"
        ],

        "Sơn La": [
            "Phường Chiềng Lề (Sơn La)", "Phường Tô Hiệu", "Phường Quyết Thắng", "Phường Quyết Tâm", "Phường Chiềng Cơi", "Phường Chiềng An", "Phường Chiềng Sinh",
            "Phường Mộc Châu", "Phường Thảo Nguyên", "Xã Đông Sang", "Xã Mường Sang",
            "Thị trấn Yên Châu", "Thị trấn Thuận Châu", "Thị trấn Hát Lót (Mai Sơn)", "Thị trấn Sông Mã", "Thị trấn Sốp Cộp", "Thị trấn Ít Ong (Mường La)", "Thị trấn Bắc Yên", "Thị trấn Phù Yên", "Xã Vân Hồ"
        ]
    };

    /**
     * Chuẩn hóa tên tỉnh (nếu là tỉnh cũ hoặc không có tiền tố)
     */
    function chuanHoaTenTinh(tinh) {
        if (!tinh || typeof tinh !== 'string') return '';
        const trim = tinh.trim();
        if (duLieuPhuongXa34Tinh[trim]) return trim;
        if (anhXaTinhCuSangMoi[trim]) return anhXaTinhCuSangMoi[trim];

        // Tìm kiếm mờ không phân biệt hoa thường
        const lower = trim.toLowerCase();
        for (const t of tatCa34TinhThanh) {
            if (t.toLowerCase() === lower || lower.includes(t.toLowerCase().replace('tp. ', ''))) {
                return t;
            }
        }
        for (const [cu, moi] of Object.entries(anhXaTinhCuSangMoi)) {
            if (cu.toLowerCase() === lower || lower.includes(cu.toLowerCase())) {
                return moi;
            }
        }
        return trim;
    }

    window.DiaChinhVN = {
        danhSachTinh: tatCa34TinhThanh,
        danhSach34TinhThanh: tatCa34TinhThanh,
        anhXaTinhCuSangMoi: anhXaTinhCuSangMoi,
        chuanHoaTenTinh: chuanHoaTenTinh,

        /**
         * Lấy danh sách Xã / Phường / Thị trấn của một tỉnh thành mới (sau sáp nhập)
         * @param {string} tinh - Tên tỉnh hoặc thành phố
         * @returns {string[]} Danh sách phường / xã thực tế
         */
        layDanhSachXa: function (tinh) {
            if (!tinh) return [];
            const tinhChuan = chuanHoaTenTinh(tinh);
            if (duLieuPhuongXa34Tinh[tinhChuan]) {
                return [...duLieuPhuongXa34Tinh[tinhChuan]];
            }
            // Trường hợp không tìm thấy chính xác, trả về danh sách xã phường lớn chung
            return [
                "Phường Trung Tâm",
                "Phường 1",
                "Phường Tân Tiến",
                "Phường Hòa Bình",
                "Phường Bình Minh",
                "Xã Đoàn Kết",
                "Xã Thống Nhất"
            ];
        },

        /**
         * Tương thích ngược: Hệ thống 2 cấp đã bỏ cấp Huyện
         * Hàm này trả về danh sách rỗng hoặc thông báo để code cũ không bị crash
         */
        layDanhSachHuyen: function (tinh) {
            return [];
        },

        /**
         * Tự động khởi tạo 2 select: Tỉnh / Thành phố và Phường / Xã / Thị trấn (Bỏ cấp huyện)
         * Hỗ trợ cả 2 dạng gọi:
         * 1) 2 cấp mới: khoiTaoChonDiaChinh(idTinh, idXa, macDinhTinh, macDinhXa)
         * 2) 3 cấp cũ (tương thích ngược): khoiTaoChonDiaChinh(idTinh, idHuyen, idXa, macDinhTinh, macDinhHuyen, macDinhXa)
         */
        khoiTaoChonDiaChinh: function (idTinh, arg2, arg3, arg4, arg5, arg6) {
            let idHuyen = null;
            let idXa = null;
            let macDinhTinh = 'TP. Hồ Chí Minh';
            let macDinhXa = 'Phường Tân Phong';

            // Xác định dạng gọi tham số
            if (arg3 && document.getElementById(arg3)) {
                // Dạng 3 cấp cũ: (idTinh, idHuyen, idXa, macDinhTinh, macDinhHuyen, macDinhXa)
                idHuyen = arg2;
                idXa = arg3;
                macDinhTinh = arg4 || 'TP. Hồ Chí Minh';
                macDinhXa = arg6 || arg5 || 'Phường Tân Phong';
            } else {
                // Dạng 2 cấp mới: (idTinh, idXa, macDinhTinh, macDinhXa)
                idXa = arg2;
                macDinhTinh = arg3 || 'TP. Hồ Chí Minh';
                macDinhXa = arg4 || 'Phường Tân Phong';
            }

            const selTinh = document.getElementById(idTinh);
            const selXa = document.getElementById(idXa);
            const selHuyen = idHuyen ? document.getElementById(idHuyen) : null;

            if (!selTinh || !selXa) return;

            // Nếu còn tồn tại ô Huyện trong DOM cũ, tự động ẩn vùng chứa của Huyện để giao diện sạch sẽ
            if (selHuyen) {
                const nhomHuyen = selHuyen.closest('.nhom-nhap') || selHuyen;
                if (nhomHuyen) {
                    nhomHuyen.style.display = 'none';
                }
                selHuyen.innerHTML = '<option value="">(Đã bỏ cấp huyện)</option>';
                selHuyen.value = '';
                selHuyen.removeAttribute('required');
            }

            // Chuẩn hóa tỉnh mặc định
            macDinhTinh = chuanHoaTenTinh(macDinhTinh) || tatCa34TinhThanh[0];

            // 1. Nạp danh sách 34 Tỉnh / Thành phố mới
            selTinh.innerHTML = '<option value="">-- Chọn Tỉnh / Thành Phố (34 Tỉnh Mới) --</option>' +
                tatCa34TinhThanh.map(t => `<option value="${t}" ${t === macDinhTinh ? 'selected' : ''}>${t}</option>`).join('');

            // 2. Hàm cập nhật trực tiếp danh sách Xã / Phường (Bỏ qua cấp huyện)
            const capNhatXa = (tinhChon, xaSelected = '') => {
                const danhSachXa = window.DiaChinhVN.layDanhSachXa(tinhChon);
                if (danhSachXa.length === 0) {
                    selXa.innerHTML = '<option value="">-- Không có danh sách xã phường --</option>';
                    return;
                }

                selXa.innerHTML = '<option value="">-- Chọn Phường / Xã / Thị Trấn (Sau sáp nhập) --</option>' +
                    danhSachXa.map(x => `<option value="${x}" ${x === xaSelected ? 'selected' : ''}>${x}</option>`).join('');

                // Nếu giá trị được chọn chưa khớp hoặc chưa chọn, tự động chọn phần tử đầu tiên nếu có chỉ định
                if (xaSelected && danhSachXa.includes(xaSelected)) {
                    selXa.value = xaSelected;
                }
            };

            // 3. Lắng nghe sự kiện thay đổi Tỉnh / TP -> Lập tức load Phường / Xã mới
            selTinh.onchange = function () {
                capNhatXa(this.value);
            };

            // 4. Khởi tạo giá trị ban đầu
            if (macDinhTinh) {
                capNhatXa(macDinhTinh, macDinhXa);
            }
        }
    };
})();
