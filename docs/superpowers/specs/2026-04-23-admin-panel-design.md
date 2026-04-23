# Admin Panel — Design Spec

## Goal

Build a full admin panel at `/admin/*` using Ant Design (desktop) for system administrators to manage users, billing, campaigns, ads, pricing, and system configuration. Restructure existing mobile app into `(app)` route group.

## Architecture

- **Monolith frontend** — admin and mobile app in same Next.js app, route-based code splitting
- **`(app)`** route group — mobile layout (antd-mobile), PWA
- **`(admin)`** route group — desktop layout (Ant Design), role-gated
- **Backend** — separate `/api/v1/admin/*` endpoints with role guards
- **Shared** — root layout (html/body/providers), auth callback, shared types from `@room-manager/shared`

## Tech Stack

- Frontend admin: Ant Design 5 (antd), Next.js App Router
- Frontend app: antd-mobile (unchanged)
- Backend: NestJS, Prisma, PostgreSQL (Supabase)
- Auth: Supabase Auth + JWT + role-based guards

---

## Phase 1 (Build Now)

### 1. Routing & Layout Restructure

**Current structure:**
```
src/app/
├── layout.tsx          ← root with mobile wrapper
├── (auth)/
├── (dashboard)/
├── auth/callback/
└── page.tsx
```

**New structure:**
```
src/app/
├── layout.tsx                ← ROOT: html + body + Providers (shared)
├── globals.css
├── error.tsx
├── not-found.tsx
├── page.tsx                  ← redirect → /dashboard
├── auth/callback/            ← unchanged
│
├── (app)/                    ← MOBILE layout
│   ├── layout.tsx            ← mobile wrapper (max-w-md, bg-white, shadow) + antd-mobile ConfigProvider
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx        ← TopBar + BottomNav + PropertyProvider
│   │   ├── dashboard/
│   │   ├── rooms/
│   │   ├── invoices/
│   │   ├── contracts/
│   │   ├── expenses/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── pricing/
│   └── onboarding/
│
├── (admin)/                  ← DESKTOP layout
│   ├── layout.tsx            ← Antd Layout: Sider + Header + Content
│   ├── (auth)/
│   │   └── admin-login/      ← admin login UI (Antd components)
│   ├── admin/
│   │   ├── page.tsx          ← placeholder dashboard (Phase 2)
│   │   ├── users/
│   │   │   ├── page.tsx      ← users table
│   │   │   └── [id]/
│   │   │       └── page.tsx  ← user detail
│   │   ├── tags/
│   │   │   └── page.tsx      ← tag management
│   │   ├── properties/
│   │   │   ├── page.tsx      ← all properties table
│   │   │   └── [id]/
│   │   │       └── page.tsx  ← property detail (read-only)
│   │   ├── billing/
│   │   │   └── page.tsx      ← subscriptions + feature grants
│   │   ├── campaigns/
│   │   │   ├── page.tsx      ← campaign list
│   │   │   ├── new/
│   │   │   │   └── page.tsx  ← create campaign wizard
│   │   │   └── [id]/
│   │   │       └── page.tsx  ← campaign detail + stats
│   │   ├── ads/
│   │   │   └── page.tsx      ← ad config management
│   │   ├── pricing/
│   │   │   └── page.tsx      ← pricing tiers management
│   │   └── settings/
│   │       └── page.tsx      ← system config
```

**Root layout changes:**
- Strip mobile wrapper (`max-w-md`, `bg-white`, `shadow`) — move to `(app)/layout.tsx`
- Keep: `<html lang="vi">`, `<body>`, `<Providers>`
- PWA metadata (manifest, appleWebApp, icons) moves to `(app)/layout.tsx`

**`(app)/layout.tsx`:**
- Mobile wrapper div with `max-w-md`, centered, shadow
- antd-mobile ConfigProvider with viVN locale
- PWA metadata

**`(admin)/layout.tsx`:**
- Antd `Layout` with collapsible `Sider` (left menu) + `Header` + `Content`
- Antd ConfigProvider with viVN locale
- Import `antd/dist/reset.css` (scoped to admin routes via Next.js code splitting)
- Menu items: Users, Tags, Properties, Billing, Campaigns, Ads, Pricing, Settings

**Middleware update:**
- `/admin/*` paths: check user role is SUPER_ADMIN or ADMIN, else redirect `/admin-login`
- `(app)` paths: keep existing auth logic (check session, redirect /login)

**CSS isolation:**
- antd CSS loaded only in `(admin)` layout
- antd-mobile CSS loaded only in `(app)` layout
- Next.js route-based code splitting handles this automatically
- globals.css: only base resets (tailwind), no component-specific styles

---

### 2. User Roles & Tags

**Schema changes (Prisma):**

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  USER
}

model users {
  // existing fields...
  role    UserRole @default(USER)
  tags    String[] @default([])
}

model tags {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  // hex color for UI badge
  created_at  DateTime @default(now())
}
```

Tags stored both as:
- `tags` table: registry of all available tags (name, description, color)
- `users.tags`: string array of tag names assigned to user

**Role hierarchy:**
- `SUPER_ADMIN`: full access, can manage other admins, system config
- `ADMIN`: access admin panel, cannot manage super_admins or system config
- `USER`: landlord, mobile app only

**Backend guards:**

```typescript
// New decorator
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)

// RolesGuard checks request.user.role against allowed roles
// Applied to all /api/v1/admin/* controllers
```

**Admin user pages:**

`/admin/users` — Antd Table:
- Columns: email, name, role, tags (Tag components), properties count, created_at, status (active/locked)
- Filters: role dropdown, tag multi-select, search by email/name
- Actions: view detail, quick role change, lock/unlock
- Pagination: server-side

`/admin/users/[id]` — User detail:
- Profile info (read-only except role)
- Role selector (Antd Select) — SUPER_ADMIN can change any role, ADMIN cannot promote to SUPER_ADMIN
- Tags section: current tags as Tag components with close button, add tag via Select dropdown
- Properties list: table of user's properties with room counts
- Subscription & billing history
- Feature grants: list of active features, grant/revoke buttons

`/admin/tags` — Tag management:
- Table: name, color badge, description, user count
- Create: modal with name, description, color picker
- Edit: inline or modal
- Delete: confirmation, auto-removes from all users
- Bulk assign: select tag → search/select users → assign

---

### 3. System Config

**Schema:**

```prisma
enum ConfigType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}

model system_configs {
  id          String     @id @default(cuid())
  key         String     @unique
  value       String
  type        ConfigType @default(STRING)
  group       String     // limits, billing, app
  description String
  updated_by  String?    @db.VarChar(30)
  updated_at  DateTime   @updatedAt
}
```

**Seed defaults:**

| Key | Value | Type | Group | Description |
|-----|-------|------|-------|-------------|
| `free_room_limit` | `10` | NUMBER | limits | Max rooms per user (free tier) |
| `free_property_limit` | `1` | NUMBER | limits | Max properties per user (free tier) |
| `default_due_day` | `10` | NUMBER | billing | Invoice due day of month |
| `auto_generate_invoices` | `true` | BOOLEAN | billing | Auto-generate invoices on 1st |
| `overdue_notification_days` | `3` | NUMBER | billing | Days after due date to notify |
| `app_name` | `Room Manager` | STRING | app | Application display name |
| `support_email` | `` | STRING | app | Support contact email |
| `maintenance_mode` | `false` | BOOLEAN | app | Enable maintenance mode |

**Backend `ConfigService`:**
- `get(key)` / `getNumber(key)` / `getBoolean(key)` — typed getters
- In-memory cache (Map), loaded on startup
- `update(key, value)` → update DB + invalidate cache
- `getAll()` → grouped configs for admin UI
- Replace hardcoded `process.env` references: `RoomsService`, `BillingService` use `ConfigService` instead

**Admin UI (`/admin/settings`):**
- Grouped cards (Limits, Billing, App)
- Each config: label + description + inline editor (Input/InputNumber/Switch based on type)
- Save per group
- SUPER_ADMIN only

---

### 4. Billing & Feature Grants

**Admin UI (`/admin/billing`):**

Tabs:
- **Subscriptions**: Antd Table of all user subscriptions (user, plan, status, period)
- **Purchase History**: Antd Table of all purchases (user, feature, amount, date, status)
- **Feature Grants**: 
  - Search user → see active features
  - Grant: select user(s) + feature(s) + optional expiry → insert `user_features`
  - Revoke: remove `user_features` row
  - Bulk grant: select multiple users (or by tag) + features

**Backend endpoints:**
- `GET /admin/subscriptions` — paginated list
- `GET /admin/purchases` — paginated list
- `POST /admin/features/grant` — `{ userIds: string[], featureKeys: string[], expiresAt?: Date }`
- `DELETE /admin/features/revoke` — `{ userId: string, featureKey: string }`

This replaces the `PREMIUM_ENABLED` env var approach. Admin directly grants features per user or bulk via campaigns.

---

### 5. Campaigns

**Schema:**

```prisma
enum CampaignStatus {
  DRAFT
  ACTIVE
  SCHEDULED
  EXPIRED
  DISABLED
}

enum CampaignTargetType {
  ALL
  BY_TAG
  BY_SIGNUP_DATE
  BY_USER_ORDER
  BY_ROLE
}

enum CampaignApplicationStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

model campaigns {
  id           String              @id @default(cuid())
  name         String
  description  String?
  status       CampaignStatus      @default(DRAFT)
  target_type  CampaignTargetType
  target_rules Json
  benefits     Json
  start_date   DateTime
  end_date     DateTime?           // null = permanent
  priority     Int                 @default(0)
  created_by   String              @db.VarChar(30)
  created_at   DateTime            @default(now())
  updated_at   DateTime            @updatedAt

  applications campaign_applications[]
  creator      users                    @relation(fields: [created_by], references: [id])
}

model campaign_applications {
  id          String                     @id @default(cuid())
  campaign_id String
  user_id     String                     @db.VarChar(30)
  applied_at  DateTime                   @default(now())
  expires_at  DateTime?
  status      CampaignApplicationStatus  @default(ACTIVE)

  campaign campaigns @relation(fields: [campaign_id], references: [id])
  user     users     @relation(fields: [user_id], references: [id])

  @@unique([campaign_id, user_id])
}
```

**target_rules examples:**
```json
// BY_TAG
{ "tags": ["early_adopter", "beta_tester"] }

// BY_SIGNUP_DATE
{ "signup_before": "2026-06-01" }
{ "signup_between": ["2026-04-01", "2026-06-01"] }

// BY_USER_ORDER
{ "user_order_range": [1, 100] }

// BY_ROLE
{ "roles": ["USER"] }
```

**benefits examples:**
```json
{
  "grant_features": ["contracts", "financial_reports", "expenses"],
  "discount_percent": 50,
  "trial_days": 30
}
```

**Evaluation flow:**
1. User signup/login → `CampaignService.evaluateUser(user)`
2. Query active campaigns where `now() BETWEEN start_date AND end_date`
3. Match user against `target_rules` per `target_type`
4. Matched + not already applied → insert `campaign_applications` + grant `user_features`
5. If `trial_days` in benefits → set `expires_at = now + trial_days`
6. Cron daily: check expired applications → revoke features, update status to EXPIRED
7. Cron daily: check campaign end_date → set status to EXPIRED, stop matching new users

**Priority resolution:**
- User matches multiple campaigns → apply all, benefits merge
- Conflict (e.g., discount 50% vs 30%) → highest priority campaign wins

**Admin UI:**

`/admin/campaigns` — list:
- Table: name, status (Tag color-coded), target, applied count, date range
- Filters: status dropdown
- Actions: edit, disable, view detail

`/admin/campaigns/new` — create wizard (Antd Steps):
1. Basic info: name, description
2. Target: select type + configure rules
3. Benefits: select features to grant, discount %, trial days
4. Schedule: start/end date pickers
5. Review: summary + preview matched user count

`/admin/campaigns/[id]` — detail:
- Campaign info (editable if DRAFT)
- Stats: matched users, applied count, active count
- Applications table: user, applied_at, status
- Manual apply/revoke per user

---

### 6. Pricing Tiers

**Admin UI (`/admin/pricing`):**
- Antd Table of `pricing_tiers`
- Columns: feature_key, tier_type, name, price, discount_percent, is_active
- CRUD via modal form
- Toggle is_active inline (Switch)
- Preview: render pricing page as landlord sees it

---

### 7. Ads Management

**Admin UI (`/admin/ads`):**
- Antd Table of `ad_config`
- Columns: position, type, enabled (Switch), content preview
- CRUD via modal with JSON editor for content field
- Toggle enabled inline
- Impressions count per ad (from `ad_impressions`)

---

### 8. Properties Overview

**Admin UI (`/admin/properties`):**
- Antd Table: name, owner (link to user), address, room count, occupied count
- Search, filter by owner
- Click → detail page: rooms table, tenant info, invoices — all read-only

---

## Phase 2 (Later)

### Admin Dashboard (`/admin` overview)
- KPI cards: total users, properties, rooms, MRR
- Charts: user growth, revenue trend, signups/day
- Recent activity feed

### Reports (`/admin/reports`)
- Revenue breakdown by period
- User metrics (signups, churn, retention)
- Feature adoption rates
- CSV export

### Campaign Extensions
- Coupon codes: user inputs code → applies campaign
- Referral tracking: invite link → both users get benefits
- A/B testing: random split → compare conversion metrics

---

## Backend Module Structure

```
src/
├── admin/
│   ├── admin.module.ts           ← imports all admin sub-modules
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── users/
│   │   ├── admin-users.controller.ts
│   │   ├── admin-users.service.ts
│   │   └── dto/
│   ├── tags/
│   │   ├── admin-tags.controller.ts
│   │   ├── admin-tags.service.ts
│   │   └── dto/
│   ├── properties/
│   │   ├── admin-properties.controller.ts
│   │   └── admin-properties.service.ts
│   ├── billing/
│   │   ├── admin-billing.controller.ts
│   │   └── admin-billing.service.ts
│   ├── campaigns/
│   │   ├── admin-campaigns.controller.ts
│   │   ├── admin-campaigns.service.ts
│   │   ├── campaign-evaluator.service.ts
│   │   └── dto/
│   ├── ads/
│   │   ├── admin-ads.controller.ts
│   │   └── admin-ads.service.ts
│   ├── pricing/
│   │   ├── admin-pricing.controller.ts
│   │   └── admin-pricing.service.ts
│   ├── config/
│   │   ├── admin-config.controller.ts
│   │   ├── config.service.ts        ← shared, used by other modules too
│   │   └── dto/
│   └── reports/                     ← Phase 2
│       ├── admin-reports.controller.ts
│       └── admin-reports.service.ts
```

---

## Admin API Endpoints Summary

All under `/api/v1/admin/`, all require `@Roles(SUPER_ADMIN, ADMIN)` unless noted.

| Module | Method | Path | Notes |
|--------|--------|------|-------|
| **Users** | GET | `/admin/users` | paginated, filterable |
| | GET | `/admin/users/:id` | detail |
| | PATCH | `/admin/users/:id` | update role, lock |
| | POST | `/admin/users/:id/tags` | assign tags |
| | DELETE | `/admin/users/:id/tags/:tag` | remove tag |
| **Tags** | GET | `/admin/tags` | list with user counts |
| | POST | `/admin/tags` | create |
| | PATCH | `/admin/tags/:id` | rename |
| | DELETE | `/admin/tags/:id` | delete + unassign |
| | POST | `/admin/tags/:id/bulk-assign` | bulk assign |
| **Properties** | GET | `/admin/properties` | list all |
| | GET | `/admin/properties/:id` | detail read-only |
| **Billing** | GET | `/admin/subscriptions` | list |
| | GET | `/admin/purchases` | list |
| | POST | `/admin/features/grant` | grant features |
| | DELETE | `/admin/features/revoke` | revoke feature |
| **Campaigns** | GET | `/admin/campaigns` | list |
| | POST | `/admin/campaigns` | create |
| | GET | `/admin/campaigns/:id` | detail + stats |
| | PATCH | `/admin/campaigns/:id` | update |
| | DELETE | `/admin/campaigns/:id` | disable |
| | POST | `/admin/campaigns/:id/preview` | count matches |
| | POST | `/admin/campaigns/:id/apply` | manual apply |
| **Ads** | GET | `/admin/ads` | list |
| | POST | `/admin/ads` | create |
| | PATCH | `/admin/ads/:id` | update |
| | DELETE | `/admin/ads/:id` | delete |
| | GET | `/admin/ads/:id/stats` | impressions |
| **Pricing** | GET | `/admin/pricing` | list |
| | POST | `/admin/pricing` | create |
| | PATCH | `/admin/pricing/:id` | update |
| | DELETE | `/admin/pricing/:id` | delete |
| **Config** | GET | `/admin/config` | all grouped (SUPER_ADMIN only) |
| | PATCH | `/admin/config` | bulk update (SUPER_ADMIN only) |
| **Reports** | | | Phase 2 |
