# UI Design Prompt — Room Manager

## Tổng quan sản phẩm

Web app quản lý phòng trọ cho chủ trọ nhỏ lẻ tại Việt Nam (1-10 phòng, mở rộng lên 50 phòng). Người dùng chính là chủ trọ — thường ít quen công nghệ, dùng điện thoại nhiều hơn máy tính. Giao diện cần đơn giản, dễ dùng, tiếng Việt.

**Platform:** Web responsive (mobile-first) + PWA.
**UI Framework:** TailwindCSS + Shadcn/Radix UI.

---

## Design System (tham khảo)

Phong cách design lấy cảm hứng từ các mockup tham khảo. Áp dụng nhất quán xuyên suốt tất cả màn hình.

### Màu sắc
- **Primary:** Xanh dương đậm (~#3B5BDB) — dùng cho CTA, sidebar active, bottom nav active, link
- **Primary light:** Xanh dương nhạt (~#EDF2FF) — dùng cho background highlight, hero card, badge nhẹ
- **Background:** Trắng (#FFFFFF) cho content, xám rất nhạt (#F8F9FA) cho page background
- **Text:** Đen đậm (#1A1A2E) cho heading, xám (#6B7280) cho secondary text
- **Status badges:**
  - Xanh lá pill (#10B981 bg nhạt, text đậm) → "Đang thuê", "Đã thanh toán"
  - Xám pill (#9CA3AF bg nhạt) → "Trống"
  - Vàng/cam pill (#F59E0B bg nhạt) → "Sửa chữa", "Chờ thanh toán", "Bản nháp"
  - Đỏ pill (#EF4444 bg nhạt) → "Quá hạn", "Nợ cuộc"
  - Nâu/vàng đậm pill → "Đang sửa chữa"

### Typography
- **Heading lớn:** Bold, cỡ lớn (24-32px), dùng cho tiêu đề trang, số tiền nổi bật
- **Số tiền:** Font size lớn nhất trong context, bold, format dấu chấm phân cách (125.000.000đ hoặc 45.2M VNĐ cho số lớn)
- **Label:** Uppercase, letter-spacing rộng, cỡ nhỏ (12px), màu xám — dùng cho "GIÁ THUÊ HÀNG THÁNG", "TỔNG THU THÁNG NÀY", "TÊN/SỐ PHÒNG"
- **Body:** 14-16px, regular weight

### Component patterns
- **Cards:** Bo góc lớn (12-16px), shadow nhẹ hoặc border xám mỏng, padding thoải mái (16-20px). Nền trắng trên page background xám nhạt.
- **Hero card (dashboard):** Background gradient xanh dương nhạt hoặc primary light, chứa số liệu chính (tổng thu), CTA nhanh bên trong (nút "Tạo hóa đơn", "Ghi số")
- **Stat cards:** Grid 2 cột trên mobile, icon bên trái hoặc trên, số lớn bold, label nhỏ bên dưới. Có thể dùng background màu nhạt khác nhau cho mỗi card (xanh nhạt, cam nhạt, đỏ nhạt...)
- **Input fields:** Bo góc (8-10px), có icon bên trái trong input, placeholder text màu xám nhạt, border xám mỏng. Suffix text cho đơn vị (VNĐ).
- **Buttons CTA:** Full-width trên mobile, bo góc lớn (10-12px), background primary, text trắng, bold. Có icon mũi tên → cho action chính.
- **Secondary buttons:** Outline hoặc background trắng với border, text primary color
- **Filter tabs:** Dạng pill/chip ngang, tab active có background primary + text trắng, tab inactive có background xám nhạt
- **FAB (Floating Action Button):** Nút tròn "+" góc phải dưới trên mobile cho action thêm mới, background primary
- **List items (cần chú ý):** Card với icon tròn bên trái (màu theo severity), text phòng + mô tả, badge trạng thái bên phải

### Layout patterns

**Mobile (< 768px):**
- Top bar: Avatar tròn trái + tên khu trọ với dropdown chevron ở giữa + icon chuông phải
- Content: scroll dọc, cards full-width, padding 16px
- Bottom navigation: 5 tab cố định (Tổng quan, Phòng, Hóa đơn, Chỉ số, Cài đặt), icon + label nhỏ, tab active đổi màu primary
- Không sidebar

**Desktop (>= 768px):**
- Sidebar trái cố định: logo + tên app trên cùng, menu items với icon, có thể collapse
- Top area trong content: có thể chứa banner upgrade (gradient xanh dương, text trắng, nút "Xem chi tiết")
- Content: max-width ~1200px, grid layout cho cards

### Onboarding patterns
- Centered layout, icon/illustration lớn ở trên
- Step indicator: "BƯỚC 1/3" text + 3 dots tròn (active = primary filled, inactive = xám)
- Form fields trong card nổi
- CTA full-width ở dưới form
- Link "Bỏ qua" text-only bên dưới CTA

### Tone
- Sạch sẽ, rộng rãi, nhiều whitespace
- Thân thiện nhưng chuyên nghiệp — không quá corporate, không quá colorful
- Các section phân tách rõ bằng background hoặc card
- Dữ liệu quan trọng (tiền, số phòng) luôn nổi bật nhất trong visual hierarchy

---

## Danh sách màn hình cần design

### 1. Auth

**1.1 Trang đăng nhập**
- Background gradient xanh dương rất nhạt phía trên, fade sang trắng
- Icon app tròn bo góc (xanh dương) căn giữa trên cùng
- Tên app "Room Manager" lớn, bold bên dưới icon
- Subtitle "Chào mừng trở lại"
- Nút "Đăng nhập bằng Google" — icon Google bên trái, nền trắng, border xám, full-width, nổi bật nhất
- Divider "HOẶC" ở giữa
- Input SĐT có icon điện thoại bên trái + Nút "Gửi OTP" full-width primary
- Link nhỏ "Đăng nhập bằng Email/Mật khẩu" bên dưới
- Link "Chưa có tài khoản? Đăng ký" cuối cùng
- Layout 1 cột, căn giữa, nhiều whitespace

**1.2 Trang đăng ký**
- Icon app nhỏ hơn + heading "Bắt đầu quản lý ngay"
- Subtitle nhỏ mô tả app
- Form: Họ và tên, Email/SĐT, Mật khẩu — mỗi input có icon bên trái
- Checkbox "Tôi đồng ý Điều khoản dịch vụ và Chính sách bảo mật"
- Nút "Đăng ký" full-width primary
- Link "Đã có tài khoản? Đăng nhập ngay"
- Sau đăng ký → onboarding

**1.3 Onboarding (sau đăng ký lần đầu)**
- Bước 1: Icon illustration lớn trên cùng + heading "Xin chào!" + subtitle hướng dẫn. Card form bên dưới với step indicator "BƯỚC 1/3" + 3 dots. Fields: tên khu trọ (có icon, placeholder "VD: Nhà trọ An Bình"), địa chỉ (có icon pin). Nút "Tiếp tục →" primary full-width + link "Bỏ qua"
- Bước 2: Top bar với logo, badge "Bước 2/3". Heading "Thêm căn phòng đầu tiên" + subtitle. Card form: tên/số phòng (placeholder "VD: Phòng 101, Tầng 1..."), giá thuê hàng tháng (input số + suffix "VNĐ"), helper text "Giá cơ bản chưa bao gồm điện nước và dịch vụ khác". Nút "Hoàn tất →" + "Bỏ qua". Footer tip: "Thiết lập nhanh chóng, sẵn sàng sử dụng."
- Bước 3: Hoàn tất → vào Dashboard

---

### 2. Layout chính (sau đăng nhập)

**Layout mobile (< 768px):**
- Top bar: Avatar tròn nhỏ (bên trái) + tên khu trọ ở giữa với dropdown chevron (VD: "Trọ Hoa Sen ▾") + icon chuông thông báo (bên phải, có badge đỏ số)
- Content area: scroll dọc, padding 16px
- Bottom navigation bar cố định: 5 tab với icon + label nhỏ
  - Tổng quan (icon grid) | Phòng (icon door) | Hóa đơn (icon receipt) | Chỉ số (icon meter) | Cài đặt (icon gear)
  - Tab active: icon + label đổi màu primary
- Banner quảng cáo: nằm phía trên bottom nav (có nút X đóng tạm, hiện lại sau)

**Layout desktop (>= 768px):**
- Sidebar trái cố định (~240px):
  - Logo + tên app "Room Manager" trên cùng
  - Menu items với icon: Tổng quan, Phòng, Hóa đơn, Chỉ số, Cài đặt
  - Menu mở rộng (mua thêm): Người thuê, Hợp đồng (icon khóa), Thu/Chi (icon khóa), Báo cáo (icon khóa)
  - Sidebar active item: background primary light, text primary, border-left primary
- Content area bên phải:
  - Search bar trên cùng + avatar + icon chuông
  - Banner quảng cáo hoặc banner upgrade premium
  - Content chính

**Feature-gated UI:** Các menu item chưa mua hiện icon khóa nhỏ. Click vào → mở trang Cửa hàng với preview tính năng.

---

### 3. Dashboard (Tổng quan)

**Hero card (nổi bật nhất, trên cùng):**
- Background gradient xanh dương nhạt, bo góc lớn
- Label "TỔNG THU THÁNG NÀY" uppercase nhỏ
- Số tiền cực lớn bold (VD: 125.000.000đ)
- 2 nút quick action bên trong hero: "Tạo hóa đơn" (icon +) và "Ghi số" (icon clipboard), nền trắng, bo góc, nằm cạnh nhau
- Desktop: thêm progress bar "Trạng thái thu tiền" (x% đã thu) và so sánh tháng trước (+12%)

**Stat cards (grid 2 cột mobile, 3-4 cột desktop):**
- Card "Tổng phòng": icon phòng, số lớn bold (VD: 60 phòng), breakdown nhỏ bên dưới dạng badge (45 đang thuê | 12 trống | 3 sửa). Background xanh nhạt
- Card "Hóa đơn chưa TT": icon cảnh báo tam giác, số lớn đỏ (VD: 8 hóa đơn), "Tổng nợ: 15.400.000đ". Background đỏ nhạt
- Card "Khách đang thuê": icon người, số lớn (VD: 38)
- Card "Hóa đơn chưa thanh toán": số + tổng tiền nợ

**Danh sách cần chú ý:**
- Header: "Danh sách cần chú ý" + link "Xem tất cả" bên phải
- Mỗi item: icon tròn bên trái (vàng cho cảnh báo, đỏ cho quá hạn), tên phòng bold, mô tả ngắn bên dưới, badge "Quá hạn" bên phải
- VD: "Phòng 101 — Hóa đơn tháng 9 chưa thanh toán" [badge Quá hạn đỏ]
- VD: "Phòng 205 — Yêu cầu sửa chữa" [badge vàng]
- Hợp đồng sắp hết hạn (nếu đã mua feature)

**Desktop thêm:**
- Banner upgrade premium nằm trên cùng content area (gradient xanh dương, text trắng, nút "Xem chi tiết") — chỉ hiện cho user free

---

### 4. Quản lý phòng

**4.1 Danh sách phòng**

Mobile — dạng card list dọc, full-width:
- Filter tabs pill ngang trên cùng: "Tất cả" (active primary) | "Trống" | "Đang thuê"
- Mỗi phòng là 1 card trắng, bo góc, shadow nhẹ:
  - Header: "Phòng 101" bold + "Tầng 1" xám nhỏ bên dưới | Badge trạng thái pill góc phải (xanh "Đang thuê", xám "Trống", vàng "Sửa chữa", đỏ "Nợ cuộc")
  - Giá thuê: số lớn bold màu primary (VD: 3.500.000đ) + label "GIÁ THUÊ/THÁNG" uppercase nhỏ
  - Nếu đang thuê: icon người + tên khách đại diện + "x người" bên dưới
  - Nếu trống: icon + text nhạt "Sẵn sàng cho thuê"
  - Nếu sửa chữa: icon công cụ + mô tả ngắn (VD: "Bảo trì điều hòa")
- FAB tròn "+" góc phải dưới

Desktop — dạng grid cards (3-4 cột):
- Search bar trên cùng bên phải + Filter tabs
- Cards nhỏ gọn hơn, hiện thêm: link "Chi tiết", link "Tạo hợp đồng" (nếu trống)
- Nút "+ Thêm phòng mới" nổi bật góc trái dưới, background primary, text trắng

- Click card → chi tiết phòng

**4.2 Chi tiết phòng**
- Thông tin phòng (sửa inline hoặc modal)
- Tab hoặc section:
  - **Người thuê:** danh sách người đang ở, nút thêm/chuyển ra
  - **Điện/Nước:** lịch sử chỉ số, biểu đồ nhỏ xu hướng
  - **Hóa đơn:** danh sách hóa đơn của phòng
  - **Phí dịch vụ:** các phí áp dụng cho phòng này, toggle bật/tắt, chỉnh số lượng

**4.3 Form thêm/sửa phòng**
- Modal hoặc drawer slide từ phải
- Các trường: tên phòng, tầng, giá thuê, cách tính (cố định/đầu người), giá/người (nếu chọn đầu người)
- Trạng thái ban đầu

---

### 5. Quản lý người thuê

**5.1 Danh sách người thuê**
- Table (desktop) / card list (mobile)
- Cột: tên, SĐT, phòng, ngày vào, trạng thái
- Filter: đang ở / đã chuyển ra
- Search theo tên hoặc SĐT
- Nút "+ Thêm người thuê"

**5.2 Form thêm/sửa người thuê**
- Modal hoặc drawer
- Các trường: họ tên, SĐT, số CCCD, upload ảnh CCCD (trước + sau), chọn phòng, ngày vào
- Upload ảnh: khu vực kéo thả hoặc chụp từ camera (mobile)

**5.3 Chi tiết người thuê**
- Thông tin cá nhân + ảnh CCCD
- Phòng đang ở
- Lịch sử hóa đơn + thanh toán
- Hợp đồng (nếu có)

---

### 6. Ghi điện/nước

**6.1 Màn hình ghi số hàng tháng**
- Chọn tháng (mặc định tháng hiện tại)
- Danh sách tất cả phòng đang thuê, mỗi phòng 1 row:
  - Tên phòng
  - Chỉ số cũ (hiện sẵn, không sửa được)
  - Input chỉ số mới điện
  - Input chỉ số mới nước
  - Hiện delta tự động (mới - cũ) + thành tiền ước tính
- Nút "Lưu tất cả" ở cuối
- Hỗ trợ nhập từng phòng hoặc tất cả cùng lúc
- Trên mobile: mỗi phòng là 1 card, swipe hoặc scroll

**6.2 Lịch sử chỉ số (theo phòng)**
- Table lịch sử: tháng, chỉ số điện, delta, thành tiền, chỉ số nước, delta, thành tiền
- Mini chart xu hướng tiêu thụ

---

### 7. Hóa đơn

**7.1 Danh sách hóa đơn**

Mobile:
- Header: "Hóa đơn" bold + "Tháng 10, 2023" với icon lịch "Chọn tháng" bên phải
- Filter tabs pill: "Tất cả" | "Chờ thanh toán" | "Đã thanh toán"
- Summary card trên cùng: "TỔNG THU DỰ KIẾN" + số tiền lớn bold (VD: 45.2M VNĐ) + badge "85% Đã thu" màu xanh lá
- Card list từng hóa đơn:
  - Icon trạng thái tròn trái (check xanh = đã TT, clock vàng = chờ)
  - "Phòng 101" bold + tên người thuê nhỏ bên dưới
  - Badge trạng thái pill: "CHỜ THANH TOÁN" vàng, "ĐÃ THANH TOÁN" xanh, "BẢN NHÁP" xám
  - Hạn chót (đỏ nếu quá hạn) bên trái dưới, "TỔNG CỘNG" + số tiền bold bên phải
- Nút "Tạo hóa đơn tháng" (tạo hàng loạt cho tất cả phòng)

**7.2 Chi tiết hóa đơn**
- Breakdown rõ ràng:
  - Tiền phòng: xxx
  - Tiền điện: chỉ số cũ → mới, delta × đơn giá = xxx
  - Tiền nước: tương tự
  - Phí dịch vụ: liệt kê từng loại + cách tính + thành tiền
  - Giảm trừ (nếu có)
  - **Tổng cộng** (in đậm, lớn)
- Lịch sử thanh toán (danh sách các lần trả)
- Nút "Ghi nhận thanh toán"
- Trạng thái + nút chuyển trạng thái

**7.3 Form ghi nhận thanh toán**
- Modal nhỏ: số tiền (mặc định = còn nợ), ngày, phương thức (tiền mặt/chuyển khoản/khác), ghi chú
- Sau khi ghi: tự cập nhật trạng thái hóa đơn (partial nếu chưa đủ, paid nếu đủ)

**7.4 Tạo hóa đơn hàng loạt**
- Chọn tháng
- Preview danh sách tất cả phòng + tổng tiền ước tính từng phòng
- Checkbox chọn/bỏ phòng
- Nút "Xác nhận tạo" → tạo hóa đơn cho tất cả phòng đã chọn

---

### 8. Cài đặt

**8.1 Thông tin khu trọ**
- Tên, địa chỉ
- Nút chuyển đổi khu trọ (nếu multi-property)

**8.2 Cấu hình điện/nước**
- Chọn loại: Điện hoặc Nước
- Cách tính: dropdown (cố định / bậc thang / đầu người / cố định/phòng)
- Form tương ứng:
  - Cố định: 1 input đơn giá
  - Bậc thang: bảng nhập bậc (từ — đến — đơn giá), nút "+ Thêm bậc"
  - Đầu người: 1 input giá/người
  - Cố định/phòng: 1 input giá/phòng

**8.3 Quản lý phí dịch vụ**
- Danh sách phí đã tạo (table)
- Mỗi row: tên, cách tính, đơn giá, áp dụng cho, toggle bật/tắt
- Nút "+ Thêm phí"
- Form thêm: tên phí, cách tính (cố định/phòng, đầu người, theo số lượng), đơn giá, áp dụng (tất cả phòng / chọn phòng)

**8.4 Thông tin cá nhân**
- Họ tên, email, SĐT, avatar
- Đổi mật khẩu (nếu dùng email/password)

**8.5 Thông báo**
- Bật/tắt push notification
- Cấu hình nhắc nợ: sau bao nhiêu ngày quá hạn, tần suất nhắc

---

### 9. Cửa hàng (Store / Pricing)

**9.1 Trang cửa hàng**
- Chia 2 section:
  - **Mua vĩnh viễn:** hiện dạng pricing cards
    - Mua lẻ: danh sách feature, giá, nút "Mua"
    - Gói bundle: 2-3 card nổi bật (Nâng cao, Pro), liệt kê feature bao gồm, giá, badge "Bao gồm bỏ quảng cáo", nút "Mua gói"
    - Mở rộng phòng: slider hoặc input chọn số phòng muốn thêm, hiện giá tự tính (có giảm giá lũy tiến), so sánh với giá gói 50
  - **Đăng ký tháng:** danh sách subscription plan, giá/tháng, nút "Đăng ký"

- Nếu đã mua feature → hiện badge "Đã mua", disable nút
- Nếu đã mua lẻ → hiện giá upgrade (đã trừ phần đã trả) cho gói bundle
- Banner "Tiết kiệm x% khi mua gói" ở đầu trang

**9.2 Flow thanh toán**
- Chọn feature/gói → trang xác nhận (tóm tắt đơn hàng, tổng tiền)
- Chọn phương thức: QR chuyển khoản / MoMo / VNPay
- QR code hiện lên với thông tin chuyển khoản
- Trạng thái: "Đang chờ xác nhận" → "Đã kích hoạt"

---

### 10. Tính năng mua thêm (feature-gated)

**10.1 Hợp đồng** (mua feature `contracts`)
- Danh sách hợp đồng: phòng, người thuê, thời hạn, trạng thái cọc, badge sắp hết hạn
- Form tạo hợp đồng: chọn phòng, người thuê, ngày bắt đầu/kết thúc, tiền cọc, nội dung điều khoản (rich text hoặc template)
- Chi tiết hợp đồng: thông tin + quản lý trạng thái cọc (đã cọc → đã trả / khấu trừ)

**10.2 Thu/Chi** (mua feature `expenses`)
- Danh sách giao dịch: ngày, loại (thu/chi), danh mục, số tiền, phòng (nếu có), ghi chú
- Filter: loại, danh mục, khoảng thời gian
- Form thêm: loại, danh mục (dropdown + tạo mới), số tiền, phòng (optional), ngày, ghi chú
- Tổng thu/chi ở header

**10.3 Báo cáo** (mua feature `financial_reports`)
- Chọn khoảng thời gian
- Card thống kê: tổng thu, tổng chi, lãi/lỗ
- Biểu đồ cột: thu/chi theo tháng
- Biểu đồ tròn: phân bổ chi phí theo danh mục
- Bảng chi tiết có thể expand

---

### 11. Thông báo

- Icon chuông trên top bar, badge số thông báo mới
- Dropdown hoặc drawer danh sách thông báo:
  - Hóa đơn quá hạn: "Phòng 101 - Nguyễn Văn A chưa thanh toán 2.500.000đ (quá hạn 5 ngày)"
  - Hợp đồng sắp hết: "Hợp đồng phòng 203 hết hạn trong 15 ngày"
- Mark as read, mark all as read

---

## Nguyên tắc design

1. **Mobile-first:** Design cho màn hình 375px trước (iPhone SE/8), sau đó responsive lên tablet/desktop. Mỗi màn hình cần cả mobile và desktop variant.
2. **Touch-friendly:** Button/input min 44px height, bo góc 8-12px, khoảng cách giữa các interactive element thoải mái (min 8px gap)
3. **Số liệu nổi bật:** Số tiền VNĐ format dấu chấm phân cách (125.000.000đ), font size lớn nhất trong context, bold. Số lớn có thể rút gọn (45.2M VNĐ). Label uppercase nhỏ phía trên.
4. **Status badge nhất quán:** Dạng pill bo góc, background nhạt + text đậm. Xanh lá = positive, vàng/cam = warning, đỏ = negative, xám = neutral. Giữ nguyên mapping xuyên suốt app.
5. **Card-based layout:** Mọi nhóm thông tin wrap trong card trắng, bo góc 12-16px, shadow nhẹ. Tránh flat list không có visual grouping.
6. **Empty state:** Illustration/icon nhỏ + text thân thiện + CTA rõ ràng ("Sẵn sàng cho thuê", "Chưa có phòng nào. Thêm phòng đầu tiên!")
7. **Feature-gate UI:** Tính năng chưa mua hiện preview mờ (blur/overlay) + nút "Mở khóa tính năng" nổi bật — cho user thấy giá trị trước khi mua
8. **Quảng cáo:** Banner nhỏ, không che nội dung, có nút đóng tạm, badge "Nâng cấp để bỏ QC"
9. **Whitespace:** Rộng rãi, thoáng. Không nhồi nhét. Padding 16-20px cho cards, 16px cho page content mobile.
10. **Hierarchy rõ ràng:** Hero card → stat cards → list. Thông tin quan trọng nhất luôn ở trên cùng, size lớn nhất.
