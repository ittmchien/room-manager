# UI Design Prompt — Room Manager
## Tổng quan sản phẩm
Web app quản lý phòng trọ cho chủ trọ nhỏ lẻ tại Việt Nam (1-10 phòng, mở rộng lên 50 phòng). Người dùng chính là chủ trọ — thường ít quen công nghệ, dùng điện thoại nhiều hơn máy tính. Giao diện cần đơn giản, dễ dùng, tiếng Việt.
**Platform:** Web responsive (mobile-first) + PWA.
**UI Framework:** TailwindCSS + Shadcn/Radix UI.
**Tone:** Sạch sẽ, chuyên nghiệp nhưng thân thiện, không quá corporate. Màu sắc gợi cảm giác tin cậy (xanh dương/xanh lá nhạt). Tránh quá nhiều màu sắc rực rỡ.

## Danh sách màn hình cần design
1. Auth: Đăng nhập, Đăng ký, Onboarding wizard.
2. Layout chính: Mobile (Bottom nav), Desktop (Sidebar).
3. Dashboard: Thẻ thống kê, Danh sách cần chú ý, Quick actions.
4. Quản lý phòng: Danh sách (grid card), Chi tiết phòng, Form thêm/sửa.
5. Quản lý người thuê: Danh sách, Form thêm/sửa, Chi tiết.
6. Ghi điện/nước: Ghi số hàng tháng, Lịch sử chỉ số.
7. Hóa đơn: Danh sách, Chi tiết, Ghi nhận thanh toán, Tạo hàng loạt.
8. Cài đặt: Thông tin khu trọ, Cấu hình điện nước, Phí dịch vụ, Cá nhân.
9. Cửa hàng: Pricing cards (vĩnh viễn/thuê bao), Flow thanh toán.
10. Tính năng mua thêm: Hợp đồng, Thu/Chi, Báo cáo.
11. Thông báo: Drawer/Dropdown thông báo.

## Nguyên tắc design
- Mobile-first
- Touch-friendly (min 44px)
- Số liệu dễ đọc (2.500.000đ)
- Trạng thái rõ ràng (Xanh/Vàng/Đỏ/Xám)
- Empty states & Skeleton loading
- Feature-gate UI (blur/lock icon)
- Quảng cáo không gây khó chịu
