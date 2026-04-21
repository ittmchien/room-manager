# Room Manager — Design Spec

Web app quản lý phòng trọ cho chủ trọ nhỏ lẻ tại Việt Nam.

## 1. Tổng quan

**Target:** Chủ trọ nhỏ lẻ (1-10 phòng). Mở rộng lên 10-50 phòng bằng cách mua thêm chức năng/gói.

**Platform:** Web responsive + PWA (push notification, install app). Mở rộng mobile app sau.

**Người dùng MVP:** Chỉ chủ trọ. Người thuê chỉ là data. Mở rộng app cho người thuê sau.

## 2. Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 16, TailwindCSS, Shadcn/Radix UI, React Query, Zustand |
| Backend | NestJS 11 |
| ORM | Prisma |
| Database | PostgreSQL (Supabase host) |
| Auth | Supabase Auth (Google, Phone OTP, Email) |
| Storage | Cloudflare R2 |
| PWA | next-pwa |
| Deploy Frontend | Vercel |
| Deploy Backend | Self-host |

**Monorepo:** pnpm workspace

## 3. Project Structure

```
room-manager/
├── packages/
│   ├── frontend/          # Next.js 16
│   │   ├── app/           # App Router
│   │   ├── components/    # UI components (Shadcn)
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Supabase client, utils
│   │   └── stores/        # Zustand stores
│   ├── backend/           # NestJS 11
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── properties/
│   │   │   ├── rooms/
│   │   │   ├── tenants/
│   │   │   ├── meters/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   ├── contracts/
│   │   │   ├── expenses/
│   │   │   ├── billing/
│   │   │   ├── notifications/
│   │   │   ├── ads/
│   │   │   └── upload/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── shared/            # Types, constants, utils dùng chung
├── package.json
└── pnpm-workspace.yaml
```

## 4. Mô hình kinh doanh

### 4.1 Free tier
- Tối đa 10 phòng, 1 khu trọ
- Ghi điện/nước, tính tiền cơ bản
- Push notification (PWA)
- Có quảng cáo (banner)

### 4.2 Mua chức năng vĩnh viễn (mua lẻ hoặc gói bundle)

**Mua lẻ:**

| Feature key | Mô tả |
|---|---|
| `rooms_slot` | Mở rộng thêm 10 phòng/slot (99k/slot, mua nhiều giảm lũy tiến) |
| `rooms_50` | Gói 50 phòng (giá cố định, rẻ hơn mua slot lẻ) |
| `multi_property` | Quản lý nhiều khu trọ |
| `contracts` | Quản lý hợp đồng, tiền cọc |
| `financial_reports` | Báo cáo thu/chi, lãi/lỗ, biểu đồ |
| `expenses` | Ghi nhận chi phí sửa chữa, bảo trì |
| `remove_ads` | Bỏ quảng cáo |

**Pricing mở rộng phòng (slot lẻ):**
- +10 phòng: 99k
- +20 phòng: 99k × 2 × 0.8 = 158k
- +30 phòng: 99k × 3 × 0.7 = 208k
- Gói 50 phòng: giá cố định rẻ hơn mua 4-5 slot

Giá cụ thể lưu trong bảng `pricing_tiers`, admin điều chỉnh được.

**Gói bundle (vĩnh viễn, bao gồm remove_ads):**
- Gói Nâng cao: rooms_30 + contracts + expenses + remove_ads
- Gói Pro: tất cả chức năng vĩnh viễn + remove_ads

### 4.3 Upgrade logic
- Nâng cấp lên gói lớn hơn → chỉ trả phần chênh lệch
- Ví dụ: đã mua +10 (99k), lên gói 50 (250k) → trả 151k
- Đã mua lẻ nhiều feature, muốn mua bundle → tổng đã trả được trừ vào giá bundle
- Tổng đã trả >= giá gói mới → upgrade miễn phí, không hoàn tiền
- Tracking qua bảng `purchase_history`

### 4.4 Subscription tháng (tính năng tốn tài nguyên)

| Plan | Bao gồm |
|---|---|
| `sms_notify` | SMS/Zalo thông báo hàng loạt |
| `cloud_backup` | Backup tự động + restore |
| `extra_storage` | Lưu trữ ảnh mở rộng (R2) |
| `advanced_export` | Export PDF/Excel báo cáo nặng |

### 4.5 Quảng cáo
- MVP: chỉ banner (top/bottom dashboard)
- AdSense mặc định, slot nội bộ khi có đối tác
- Mua `remove_ads` hoặc bất kỳ gói bundle → ẩn tất cả
- Tracking impressions/clicks cho slot nội bộ

### 4.6 Payment integration
- Thanh toán: chuyển khoản (QR code), MoMo, VNPay
- MVP: admin duyệt thủ công hoặc webhook từ payment gateway

## 5. Chức năng chi tiết

### 5.1 MVP — Free

**Auth:**
- Đăng ký/đăng nhập qua Google, SĐT (OTP), email/password
- Supabase Auth SDK ở frontend, NestJS verify token

**Quản lý phòng:**
- CRUD phòng: tên/số phòng, tầng, giá thuê
- Trạng thái: trống (vacant), đang thuê (occupied), sửa chữa (maintenance)
- Cấu hình phí dịch vụ mặc định cho từng phòng

**Quản lý người thuê:**
- Thông tin: tên, SĐT, CCCD, ảnh CCCD
- Ngày vào/ra, trạng thái (active/moved_out)
- Nhiều người thuê chung 1 phòng

**Ghi điện/nước:**
- Nhập chỉ số hàng tháng, tự tính delta (mới - cũ)
- Hỗ trợ đơn giá cố định và bậc thang

**Tính tiền phòng (chi tiết):**

Tiền phòng:
- Giá cố định/tháng
- Hoặc giá theo đầu người × số người

Tiền điện:
- Đơn giá cố định (VD: 3.500đ/kWh)
- Hoặc bậc thang (chủ trọ tự cấu hình hoặc theo EVN)
- Tính theo delta chỉ số

Tiền nước:
- Đơn giá cố định
- Hoặc bậc thang
- Hoặc theo đầu người (VD: 50.000đ/người/tháng)
- Hoặc phí cố định/phòng

Phí dịch vụ (wifi, rác, giữ xe, giặt đồ...):
- Chủ trọ tự tạo loại phí, tự đặt tên
- Cách tính mỗi loại:
  - Cố định/phòng (VD: wifi 50k/phòng)
  - Theo đầu người (VD: rác 20k/người)
  - Theo số lượng (VD: giữ xe 50k/xe, nhập số xe mỗi phòng)
- Áp dụng: tất cả phòng hoặc chọn phòng cụ thể
- Bật/tắt theo tháng

Công thức hóa đơn:
```
Tổng = tiền phòng
     + tiền điện (delta × đơn giá hoặc bậc thang)
     + tiền nước (theo cấu hình)
     + Σ phí dịch vụ (mỗi phí tính theo cách riêng)
     - giảm trừ (nếu có)
```

**Hóa đơn & thanh toán:**
- Tạo hóa đơn hàng tháng (tự động hoặc thủ công)
- Trạng thái: chờ thanh toán (pending), trả một phần (partial), đã trả (paid)
- Ghi nhận thanh toán: số tiền, ngày, phương thức (tiền mặt/chuyển khoản/khác)

**Nhắc tiền:**
- Push notification (PWA) khi hóa đơn quá hạn
- Cron job check hàng ngày

**Dashboard:**
- Số phòng trống/đang thuê
- Tổng thu tháng hiện tại
- Danh sách hóa đơn chưa thanh toán / quá hạn

### 5.2 Mua lẻ / gói (vĩnh viễn)

**Mở rộng phòng:** tăng limit số phòng quản lý (xem pricing mục 4.2)

**Multi-property:** quản lý nhiều khu trọ, chuyển đổi giữa các khu

**Hợp đồng:**
- Tạo hợp đồng từ template
- Quản lý tiền cọc (đã cọc/đã trả/khấu trừ)
- Nhắc hợp đồng sắp hết hạn (cron job)

**Báo cáo tài chính:**
- Thu/chi theo tháng/năm
- Lãi/lỗ theo khu trọ
- Biểu đồ trực quan

**Quản lý thu/chi:**
- Ghi nhận chi phí: sửa chữa, bảo trì, mua sắm, chi phí phát sinh
- Phân loại theo category
- Gắn với phòng cụ thể hoặc chi phí chung

### 5.3 Subscription tháng
- SMS/Zalo thông báo hàng loạt cho người thuê
- Backup tự động + restore
- Lưu trữ ảnh mở rộng
- Export báo cáo PDF/Excel nâng cao

## 6. Data Model

### users
- id, supabase_user_id, email, phone, name, avatar
- created_at, updated_at

### properties
- id, owner_id (FK users), name, address
- created_at, updated_at

### rooms
- id, property_id (FK properties), name, floor
- rent_price, rent_calc_type (fixed / per_person)
- rent_per_person_price (nullable — dùng khi calc_type = per_person)
- status (vacant / occupied / maintenance)
- created_at, updated_at

### tenants
- id, room_id (FK rooms), name, phone, id_card, id_card_image
- move_in_date, move_out_date, status (active / moved_out)
- created_at, updated_at

### utility_configs
- id, property_id (FK properties), type (electric / water)
- calc_type (fixed / tiered / per_person / fixed_per_room)
- unit_price (dùng khi calc_type = fixed)
- per_person_price (dùng khi calc_type = per_person)
- fixed_room_price (dùng khi calc_type = fixed_per_room)
- tiers (JSON — bậc thang, VD: [{"from": 0, "to": 50, "price": 3500}, ...])
- created_at, updated_at

### service_fees
- id, property_id (FK properties), name
- calc_type (fixed_per_room / per_person / per_quantity / tiered)
- unit_price, tiers (JSON — cho bậc thang)
- apply_to (all / selected_rooms)
- created_at, updated_at

### room_service_fees
- id, room_id (FK rooms), service_fee_id (FK service_fees)
- enabled, custom_price (nullable override)
- quantity (cho per_quantity, VD: số xe)

### meter_readings
- id, room_id (FK rooms), type (electric / water)
- reading_value, previous_value, reading_date
- created_at

### invoices
- id, room_id (FK rooms), tenant_id (FK tenants)
- billing_period (YYYY-MM), room_fee, electric_fee, water_fee
- service_fees_detail (JSON — breakdown từng phí)
- discount, total, paid_amount
- status (pending / partial / paid)
- due_date, paid_date
- created_at, updated_at

### payments
- id, invoice_id (FK invoices), amount
- payment_date, method (cash / transfer / other)
- note
- created_at

### contracts
- id, room_id (FK rooms), tenant_id (FK tenants)
- start_date, end_date, deposit_amount
- deposit_status (pending / paid / returned / deducted)
- terms (text), template_id
- created_at, updated_at

### expenses
- id, property_id (FK properties), room_id (FK rooms, nullable)
- category, type (income / expense), amount
- date, note
- created_at

### user_features
- id, user_id (FK users), feature_key
- purchased_at, expires_at (null = vĩnh viễn)

### purchase_history
- id, user_id (FK users), feature_key
- amount_paid, purchased_at
- status (active / upgraded / void)

### subscriptions
- id, user_id (FK users), plan
- status (active / cancelled / expired)
- current_period_start, current_period_end

### pricing_tiers
- id, feature_key, tier_type (single / slot / bundle)
- tier_name, price, discount_percent
- included_features (JSON — danh sách feature_key trong bundle, nullable)
- slot_size (số phòng mỗi slot, nullable)
- is_active

### ad_config
- id, position (top_banner / bottom_banner)
- type (adsense / internal), enabled
- content (JSON — ad code hoặc nội dung nội bộ)

### ad_impressions
- id, ad_config_id (FK ad_config)
- user_id (FK users), type (impression / click)
- created_at

## 7. Architecture

### Request flow
```
Browser (Next.js PWA)
    ↓
Vercel (SSR + frontend logic)
    ↓
NestJS API (self-host) ← Prisma → Supabase PostgreSQL
    ↓
Supabase Auth (login/token verify)
Cloudflare R2 (upload ảnh)
```

### Auth flow
1. User login qua Supabase Auth SDK (Google/Phone/Email) ở frontend
2. Frontend gửi Supabase access token trong Authorization header
3. NestJS verify token với Supabase, lấy user_id
4. NestJS check user_features/subscriptions để phân quyền chức năng

### Feature-gating
- NestJS: decorator `@RequireFeature('contracts')` + guard check bảng user_features
- Frontend: check feature list để hiện/ẩn UI + hiện nút "Mua tính năng"

### Upload flow (R2)
1. Frontend request presigned URL từ NestJS
2. Frontend upload trực tiếp lên R2
3. NestJS lưu file key vào DB

### Cron jobs (NestJS)
- Hàng tháng: tạo hóa đơn tự động từ meter readings + cấu hình phí
- Hàng ngày: check hóa đơn quá hạn → push nhắc nợ
- Hàng ngày: check hợp đồng sắp hết hạn → thông báo
- Hàng tháng: check subscription hết hạn
