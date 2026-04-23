# Stitch Design System Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Room Manager frontend to match the Stitch "Modern Sanctuary" design system — replacing the current gray/blue Tailwind + antd-mobile styling with Material Design 3 surface tokens, dual-font typography, no-border tonal architecture, glassmorphism nav, and gradient buttons.

**Architecture:** Phase-based redesign starting with design tokens (CSS variables + Tailwind theme), then layout shell (TopBar, BottomNav), then screen-by-screen conversion. Each phase produces a working app — no broken intermediate states. We keep antd-mobile for complex widgets (Popup, TabBar internals) but restyle them to match Stitch tokens.

**Tech Stack:** Tailwind CSS v4 (PostCSS, @theme), Be Vietnam Pro + Inter (dual font), Material Symbols Outlined (icons), CSS custom properties for Material Design 3 color tokens, existing Next.js 16 / React 19 / antd-mobile stack.

---

## File Map

### Phase 1 — Design Tokens & Foundation
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/app/globals.css` | Material Design 3 color tokens, dual-font setup, no-line resets, antd-mobile token overrides |
| Create | `packages/frontend/src/lib/design-tokens.ts` | Exported color/spacing constants for JS usage (status configs, etc.) |

### Phase 2 — Layout Shell
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/components/layout/top-bar.tsx` | Stitch TopBar: Be Vietnam Pro branding, notification bell, avatar, surface background |
| Modify | `packages/frontend/src/components/layout/bottom-nav.tsx` | Stitch glassmorphism nav: backdrop-blur, active pill highlight, Material Symbols icons, 5 tabs |
| Modify | `packages/frontend/src/app/(app)/(dashboard)/layout.tsx` | Surface background, remove gray-50, adjust container styling |

### Phase 3 — Auth Screens
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/app/(app)/(auth)/layout.tsx` | Stitch ambient blobs, surface background, glassmorphism card |
| Modify | `packages/frontend/src/components/auth/login-form.tsx` | Stitch login: Material icon door_front, gradient CTA, phone/email options, tonal inputs |
| Modify | `packages/frontend/src/components/auth/register-form.tsx` | Stitch register: glassmorphism card, labeled inputs with icons, gradient CTA |

### Phase 4 — Onboarding
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/components/auth/onboarding-wizard.tsx` | Stitch onboarding: step dots, tonal input cards with left-accent bars, status toggles |

### Phase 5 — Dashboard
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx` | Stitch dashboard: greeting, announcement banner, quick actions row, 2x2 bento stats, attention list |

### Phase 6 — Room Screens
| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `packages/frontend/src/components/rooms/room-card.tsx` | Stitch room card: left accent bar, status pills (semantic colors), right-aligned currency, no-border tonal card |
| Modify | `packages/frontend/src/components/rooms/room-status-badge.tsx` | Stitch status badges: secondary-fixed/tertiary-fixed/error-container/surface-variant backgrounds |
| Modify | `packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx` | Stitch room list: pill filter tabs, FAB button, adjusted spacing |
| Create | `packages/frontend/src/app/(app)/(dashboard)/rooms/[id]/page.tsx` | Stitch room detail: contextual app bar, key stats bento, tab nav, tenant cards (if not exists — check first) |

---

## Task 1: Design Tokens — CSS Variables & Tailwind Theme

**Files:**
- Modify: `packages/frontend/src/app/globals.css`

### Steps

- [ ] **Step 1: Add Material Design 3 color tokens to `:root`**

Replace the existing `:root` block and `@theme` block in `globals.css` with:

```css
@layer theme, base, antd, components, utilities;
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");
@import "tailwindcss";
@import "antd-mobile/bundle/style.css";

@theme {
  --breakpoint-xxxs: 320px;
  --breakpoint-xxs: 375px;
  --breakpoint-xs: 425px;

  /* Material Design 3 Color Tokens */
  --color-surface: #f6fafe;
  --color-surface-dim: #d6dade;
  --color-surface-bright: #f6fafe;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f0f4f8;
  --color-surface-container: #eaeef2;
  --color-surface-container-high: #e4e9ed;
  --color-surface-container-highest: #dfe3e7;
  --color-surface-variant: #dfe3e7;

  --color-primary: #004ac6;
  --color-primary-container: #2563eb;
  --color-on-primary: #ffffff;
  --color-on-primary-container: #eeefff;
  --color-on-primary-fixed: #00174b;
  --color-on-primary-fixed-variant: #003ea8;
  --color-primary-fixed: #dbe1ff;
  --color-primary-fixed-dim: #b4c5ff;
  --color-inverse-primary: #b4c5ff;

  --color-secondary: #006e2f;
  --color-secondary-container: #6bff8f;
  --color-on-secondary: #ffffff;
  --color-on-secondary-container: #007432;
  --color-on-secondary-fixed: #002109;
  --color-on-secondary-fixed-variant: #005321;
  --color-secondary-fixed: #6bff8f;
  --color-secondary-fixed-dim: #4ae176;

  --color-tertiary: #943700;
  --color-tertiary-container: #bc4800;
  --color-on-tertiary: #ffffff;
  --color-on-tertiary-container: #ffede6;
  --color-on-tertiary-fixed: #360f00;
  --color-on-tertiary-fixed-variant: #7d2d00;
  --color-tertiary-fixed: #ffdbcd;
  --color-tertiary-fixed-dim: #ffb596;

  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
  --color-on-error: #ffffff;
  --color-on-error-container: #93000a;

  --color-on-surface: #171c1f;
  --color-on-surface-variant: #434655;
  --color-on-background: #171c1f;
  --color-background: #f6fafe;
  --color-outline: #737686;
  --color-outline-variant: #c3c6d7;
  --color-surface-tint: #0053db;
  --color-inverse-surface: #2c3134;
  --color-inverse-on-surface: #edf1f5;

  /* Font families */
  --font-headline: "Be Vietnam Pro", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-label: "Inter", sans-serif;
}

:root {
  --font-sans: "Be Vietnam Pro", sans-serif;
  --adm-color-primary: #004ac6;
  --adm-font-family: "Inter", sans-serif;
}
```

- [ ] **Step 2: Add base styles for dual-font system and no-line rules**

Append after `:root`:

```css
body {
  font-family: var(--font-body);
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}

h1, h2, h3, h4, h5, h6, .font-headline {
  font-family: var(--font-headline);
}

/* Stitch "No-Line" Rule — override antd-mobile defaults */
.adm-card {
  --border-radius: 12px;
  border: none !important;
}

.adm-list {
  --border-top: none;
  --border-bottom: none;
  --border-inner: none;
}

.adm-input-element,
.adm-text-area-element {
  font-size: 15px !important;
  font-family: var(--font-body);
}

.adm-tabs-tab {
  --title-font-size: 14px;
  font-family: var(--font-headline);
}

.adm-tab-bar {
  --adm-color-primary: var(--color-primary);
}

/* Ambient shadow utility */
.shadow-ambient {
  box-shadow: 0 24px 40px rgba(23, 28, 31, 0.04);
}

.shadow-ambient-sm {
  box-shadow: 0 4px 20px rgba(23, 28, 31, 0.02);
}

/* Ghost border utility */
.border-ghost {
  border: 1px solid rgba(195, 198, 215, 0.15);
}

/* Material Symbols baseline */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

.adm-error-block-image {
  place-self: center;
  justify-self: center;
}
```

- [ ] **Step 3: Verify fonts load correctly**

Run: `cd /Users/comchientrung/company/room-manager && pnpm --filter frontend dev`

Open browser, inspect `<body>` — confirm font-family shows "Inter". Inspect any `<h1>` — confirm "Be Vietnam Pro". Check Material Symbols icon renders (will test in later tasks).

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/app/globals.css
git commit -m "feat(design): add Material Design 3 color tokens and dual-font system"
```

---

## Task 2: Design Tokens — JS Constants

**Files:**
- Create: `packages/frontend/src/lib/design-tokens.ts`

- [ ] **Step 1: Create design-tokens.ts with status color configs**

```typescript
/**
 * Stitch "Modern Sanctuary" design tokens for JS usage.
 * Maps room/invoice statuses to the Material Design 3 semantic colors.
 */

export const roomStatusStyles = {
  OCCUPIED: {
    label: 'Đang thuê',
    bar: 'bg-secondary-fixed',
    badge: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  VACANT: {
    label: 'Trống',
    bar: 'bg-surface-variant',
    badge: 'bg-surface-variant text-on-surface-variant',
  },
  MAINTENANCE: {
    label: 'Đang sửa',
    bar: 'bg-tertiary-fixed',
    badge: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
} as const;

export const invoiceStatusStyles = {
  PAID: {
    label: 'Đã đóng',
    badge: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  PENDING: {
    label: 'Chưa đóng',
    badge: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  OVERDUE: {
    label: 'Quá hạn',
    badge: 'bg-error-container text-on-error-container',
  },
} as const;

export const attentionItemStyles = {
  debt: { bar: 'bg-error', icon: 'payments' },
  repair: { bar: 'bg-tertiary', icon: 'build' },
  expiring: { bar: 'bg-surface-variant', icon: 'event_busy' },
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/lib/design-tokens.ts
git commit -m "feat(design): add JS design token constants for status styles"
```

---

## Task 3: Layout — Dashboard Shell & Background

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/layout.tsx`

- [ ] **Step 1: Update dashboard layout to use surface tokens**

Replace the `DashboardInner` and `DashboardLayout` components. Key changes:
- `bg-gray-50` → `bg-surface`
- `bg-white` (spinner overlay) → `bg-surface-container-lowest`
- `border-blue-100 border-t-blue-600` → `border-primary-fixed border-t-primary`
- `text-gray-400` → `text-on-surface-variant`
- Padding stays same (responsive breakpoints)

```tsx
function DashboardInner({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  const [loaded, setLoaded] = useState(false);
  const fetchStarted = useRef(false);

  useLayoutEffect(() => {
    if (isFetching > 0) fetchStarted.current = true;
    if (fetchStarted.current && isFetching === 0) setLoaded(true);
  }, [isFetching]);

  return (
    <>
      {!loaded && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface-container-lowest">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-fixed border-t-primary" />
            <p className="text-sm text-on-surface-variant">Đang tải...</p>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto py-2 px-2 xxs:px-3 xs:px-4 [&_.no-padding]:-mx-2 xxs:[&_.no-padding]:-mx-3 xs:[&_.no-padding]:-mx-4">
        {children}
      </main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={viVN}>
      <PropertyProvider>
        <div className="flex h-dvh flex-col bg-surface">
          <TopBar />
          <DashboardInner>{children}</DashboardInner>
          <BottomNav />
        </div>
      </PropertyProvider>
    </ConfigProvider>
  );
}
```

- [ ] **Step 2: Verify app loads with surface background**

Run dev server, confirm background is `#f6fafe` (soft blue-white) instead of Tailwind `gray-50`.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/\(app\)/\(dashboard\)/layout.tsx
git commit -m "feat(design): update dashboard layout to surface token background"
```

---

## Task 4: Layout — TopBar Redesign

**Files:**
- Modify: `packages/frontend/src/components/layout/top-bar.tsx`

- [ ] **Step 1: Restyle TopBar to match Stitch design**

Key changes from current:
- Replace `bg-white border-b border-gray-100` → `bg-surface sticky top-0 z-40` with ghost border
- Replace `text-gray-400` / `text-gray-900` → `text-on-surface-variant` / `text-on-surface`
- Add notification bell icon (currently commented out — keep commented but restyle for when enabled)
- Replace `text-blue-600` → `text-primary`
- Style property selector popup with surface tokens
- Replace Lucide icons with Material Symbols where feasible (optional — can keep Lucide for now since it works)

Update the TopBar JSX — replace the top bar `<div>`:

```tsx
{/* TopBar */}
<div className="flex h-14 items-center justify-between bg-surface border-b border-outline-variant/15 px-4 sticky top-0 z-40">
  {/* Branch selector trigger */}
  <button
    onClick={() => setSelectorOpen(true)}
    className="flex flex-col items-start leading-tight min-w-0"
  >
    <span className="text-xs font-medium text-on-surface-variant font-label">Chi nhánh hiện tại</span>
    <div className="flex items-center gap-1">
      <span className="text-sm font-bold text-on-surface font-headline max-w-[220px] truncate">
        {propertyName}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
    </div>
  </button>
</div>
```

Update the popup content — replace `text-gray-*` classes:
- `text-gray-900` → `text-on-surface`
- `text-gray-400` → `text-on-surface-variant`
- `text-gray-500` → `text-on-surface-variant`
- `text-blue-600` → `text-primary`
- `border-gray-200` → `border-outline-variant/30`
- `hover:border-blue-300 hover:text-blue-600` → `hover:border-primary/30 hover:text-primary`
- `divide-gray-100` → `divide-outline-variant/15`
- `bg-gray-50` in add-property popup → `bg-surface-container-low`

- [ ] **Step 2: Verify TopBar renders with new tokens**

Check branch selector opens/closes, property switching works, colors match Stitch.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/layout/top-bar.tsx
git commit -m "feat(design): restyle TopBar with surface tokens and ghost borders"
```

---

## Task 5: Layout — BottomNav Redesign

**Files:**
- Modify: `packages/frontend/src/components/layout/bottom-nav.tsx`

- [ ] **Step 1: Restyle BottomNav to match Stitch glassmorphism design**

Key changes:
- Add glassmorphism: `bg-surface-container-lowest/80 backdrop-blur-xl`
- Active tab: pill with `bg-primary text-on-primary rounded-xl` (scale-110)
- Inactive tab: `text-on-surface-variant`
- Add 5th tab: "Ghi số" (meter readings) — matches Stitch bottom nav
- Replace `border-gray-100` → `border-outline-variant/15`
- Add `rounded-t-2xl` to nav container
- Use `font-headline` for tab labels
- Shadow: `shadow-[0_-4px_24px_rgba(23,28,31,0.04)]`

Replace BottomNav component body:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useInvoices } from "@/hooks/use-invoices";
import { useProperty } from "@/contexts/property-context";

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const tabs = [
  { key: "/dashboard", title: "Tổng quan", icon: "dashboard" },
  { key: "/rooms", title: "Phòng", icon: "door_front" },
  { key: "/invoices", title: "Hóa đơn", icon: "receipt_long" },
  { key: "/meter-readings", title: "Ghi số", icon: "edit_note" },
  { key: "/settings", title: "Cài đặt", icon: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { propertyId } = useProperty();

  const { data: invoices } = useInvoices(propertyId, getCurrentBillingPeriod());
  const pendingCount = invoices?.filter((inv) => inv.status !== "PAID").length ?? 0;

  const activeKey =
    tabs.find((t) => pathname.startsWith(t.key))?.key ?? "/dashboard";

  return (
    <nav className="sticky bottom-0 z-50 w-full max-w-md border-t border-outline-variant/15 bg-surface-container-lowest/80 backdrop-blur-xl rounded-t-2xl shadow-[0_-4px_24px_rgba(23,28,31,0.04)]">
      <div className="flex justify-around items-center px-2 pb-6 pt-2">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          const badge = tab.key === "/invoices" ? pendingCount : 0;

          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 font-headline text-[10px] uppercase tracking-wider",
                isActive
                  ? "bg-primary text-on-primary scale-110"
                  : "text-on-surface-variant active:bg-surface-container-low"
              )}
            >
              <span
                className="material-symbols-outlined mb-1 text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="relative">
                {tab.title}
                {badge > 0 && !isActive && (
                  <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error ring-2 ring-surface-container-lowest">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Handle missing "/meter-readings" route**

If `/meter-readings` route doesn't exist, the tab will navigate but show 404. This is acceptable — route will be created separately. Alternatively, map to existing route if one exists (check for `/meter-readings` or similar).

- [ ] **Step 3: Verify BottomNav renders with glassmorphism**

Check: backdrop-blur visible, active tab has pill highlight, Material Symbols icons render, navigation between tabs works.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/layout/bottom-nav.tsx
git commit -m "feat(design): redesign BottomNav with glassmorphism and Material Symbols"
```

---

## Task 6: Auth — Layout Redesign

**Files:**
- Modify: `packages/frontend/src/app/(app)/(auth)/layout.tsx`

- [ ] **Step 1: Update auth layout to match Stitch ambient background**

Replace entire component:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8 bg-surface">
      {/* Ambient background blobs — Stitch style */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container opacity-5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary opacity-5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify auth pages render with new layout**

Navigate to `/login` — confirm soft blue-tinted background with ambient blobs, white card with ambient shadow.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/\(app\)/\(auth\)/layout.tsx
git commit -m "feat(design): redesign auth layout with ambient blobs and surface tokens"
```

---

## Task 7: Auth — Login Form Redesign

**Files:**
- Modify: `packages/frontend/src/components/auth/login-form.tsx`

- [ ] **Step 1: Restyle login form to match Stitch design**

Key changes:
- Logo: Replace emoji with Material Symbols `door_front` icon (filled)
- Title typography: `font-headline text-3xl font-bold tracking-tight text-on-surface`
- Subtitle: `font-body text-sm text-on-surface-variant`
- Google button: Gradient primary → `bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl`
- Phone button: `bg-surface-container-high text-on-surface rounded-xl`
- Divider: ghost lines with `bg-outline-variant opacity-30`
- Email/Password link: tertiary text style `text-primary font-medium`
- Footer: `font-label text-[0.6875rem] text-on-surface-variant`
- Replace `bg-gray-50` inputs → `bg-surface-container-low`
- Replace all `text-gray-*` → surface tokens

Replace the component return:

```tsx
return (
  <div className="flex flex-col items-center">
    {/* Logo */}
    <div className="mb-10 text-center">
      <span
        className="material-symbols-outlined text-primary text-5xl mb-4 block"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        door_front
      </span>
      <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
        Room Manager
      </h1>
      <p className="font-body text-sm text-on-surface-variant mt-2">
        Quản lý không gian của bạn
      </p>
    </div>

    {/* Auth buttons */}
    <div className="w-full space-y-4">
      <Button
        block
        onClick={signInWithGoogle}
        disabled={loading}
        className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !font-body !font-medium !text-sm !py-3.5 !rounded-xl !border-none hover:!opacity-90 transition-opacity"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
          Đăng nhập bằng Google
        </span>
      </Button>

      {/* Phone login button — secondary style */}
      <Button
        block
        fill="none"
        className="!bg-surface-container-high !text-on-surface !font-body !font-medium !text-sm !py-3.5 !rounded-xl hover:!bg-surface-variant transition-colors"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="material-symbols-outlined">call</span>
          Đăng nhập bằng SĐT
        </span>
      </Button>
    </div>

    {/* Divider */}
    <div className="mt-8 flex items-center w-full">
      <div className="flex-grow h-px bg-outline-variant opacity-30" />
      <span className="px-4 font-body text-xs text-on-surface-variant uppercase tracking-widest">
        Hoặc
      </span>
      <div className="flex-grow h-px bg-outline-variant opacity-30" />
    </div>

    {/* Email/password form */}
    <div className="mt-8 w-full flex flex-col gap-3">
      <div className="rounded-xl bg-surface-container-low px-3">
        <p className="pt-2.5 text-xs text-on-surface-variant font-label">Email</p>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={setEmail}
          style={{ '--font-size': '15px' } as React.CSSProperties}
        />
      </div>

      <div className="rounded-xl bg-surface-container-low px-3">
        <p className="pt-2.5 text-xs text-on-surface-variant font-label">Mật khẩu</p>
        <div className="flex items-center">
          <div className="flex-1">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              style={{ '--font-size': '15px' } as React.CSSProperties}
            />
          </div>
          <Button
            fill="none"
            onClick={() => setShowPassword(!showPassword)}
            className="!text-outline !p-0 !min-w-0"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-error-container px-3 py-2 text-center text-sm text-on-error-container">
          {error}
        </p>
      )}

      <Button
        block
        loading={loading}
        disabled={!email || !password}
        onClick={handleSubmit}
        className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !text-base !font-semibold !font-headline !rounded-xl !py-3.5 !border-none"
      >
        Đăng nhập
      </Button>
    </div>

    {/* Footer */}
    <div className="mt-12 text-center">
      <p className="font-label text-[0.6875rem] text-on-surface-variant">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-headline font-semibold text-primary hover:text-primary-container transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  </div>
);
```

- [ ] **Step 2: Verify login page matches Stitch screenshot**

Compare with `stitch_vietroom_manager/ng_nh_p_mobile_room_manager/screen.png`. Check: door icon, gradient button, tonal divider, surface-container-low inputs.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/auth/login-form.tsx
git commit -m "feat(design): redesign login form with Stitch Modern Sanctuary style"
```

---

## Task 8: Room Card Redesign

**Files:**
- Modify: `packages/frontend/src/components/rooms/room-card.tsx`

- [ ] **Step 1: Update RoomCard to use Stitch design tokens**

Replace `statusConfig` and card JSX. Key changes:
- Import from `@/lib/design-tokens` for status styles
- Card: `bg-surface-container-lowest rounded-xl shadow-ambient-sm border-ghost`
- Left accent bar uses status-semantic colors from design tokens
- Status badge: semantic pill with uppercase tracking
- Price: `font-headline text-[1.25rem] font-bold text-primary` right-aligned
- Remove emerald/amber/blue Tailwind colors → Material tokens
- Currency: "đ" suffix with reduced opacity

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Room } from '@/hooks/use-rooms';
import { cn } from '@/lib/utils';
import { roomStatusStyles } from '@/lib/design-tokens';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export function RoomCard({ room, onPress }: { room: Room; onPress?: (id: string) => void }) {
  const router = useRouter();
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];
  const cfg = roomStatusStyles[room.status as keyof typeof roomStatusStyles] ?? roomStatusStyles.VACANT;

  return (
    <button
      onClick={() => onPress ? onPress(room.id) : router.push(`/rooms/${room.id}`)}
      className="group flex w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm border-ghost transition-all active:scale-[0.98] text-left relative"
    >
      {/* Status accent bar */}
      <div className={cn('absolute left-0 top-4 bottom-4 w-1 rounded-r-full', cfg.bar)} />

      <div className="flex flex-1 flex-col gap-3 p-4 pl-5">
        {/* Top row: room name + status badge */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-headline text-[1.125rem] font-semibold text-on-surface">
              {room.name}
            </h2>
            {firstTenant ? (
              <p className="font-body text-[0.875rem] text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">person</span>
                <span className="truncate">
                  {firstTenant.name}
                  {activeTenantsCount > 1 && (
                    <span className="ml-1 font-semibold text-primary">+{activeTenantsCount - 1}</span>
                  )}
                </span>
              </p>
            ) : (
              <p className="font-body text-[0.875rem] text-on-surface-variant mt-0.5 italic">
                Phòng trống
              </p>
            )}
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full font-label text-[0.6875rem] font-medium uppercase tracking-wider',
            cfg.badge
          )}>
            {cfg.label}
          </span>
        </div>

        {/* Bottom row: info + price */}
        <div className="flex justify-between items-end">
          {room.floor != null && (
            <span className="font-body text-[0.875rem] text-on-surface-variant">
              Tầng {room.floor}
            </span>
          )}
          <p className="font-headline text-[1.25rem] font-bold text-primary ml-auto">
            {formatPrice(room.rentPrice)}
            <span className="text-[0.875rem] font-medium ml-0.5 opacity-80">đ</span>
          </p>
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Update RoomStatusBadge to use design tokens**

```tsx
import { cn } from '@/lib/utils';
import { roomStatusStyles } from '@/lib/design-tokens';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = roomStatusStyles[status];
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full font-label text-[0.6875rem] font-medium uppercase tracking-wider',
      cfg.badge
    )}>
      {cfg.label}
    </span>
  );
}
```

- [ ] **Step 3: Verify room cards match Stitch screenshot**

Compare with `stitch_vietroom_manager/danh_s_ch_ph_ng_mobile_room_manager/screen.png`. Check: left accent bar, status badge pills, right-aligned currency, no border lines.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/rooms/room-card.tsx packages/frontend/src/components/rooms/room-status-badge.tsx
git commit -m "feat(design): redesign RoomCard and RoomStatusBadge with Stitch tokens"
```

---

## Task 9: Rooms Page — Filter Tabs & FAB

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx`

- [ ] **Step 1: Restyle rooms page to match Stitch design**

Key changes:
- Page title: `font-headline text-[1.5rem] font-bold text-on-surface`
- Filter tabs: horizontal scroll pills
  - Active: `bg-primary-container text-on-primary-container rounded-full shadow-ambient-sm`
  - Inactive: `bg-surface-container-high text-on-surface rounded-full`
- Room list: `flex flex-col gap-4` (keep existing)
- Add FAB button at bottom-right:
  - `fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-[0_8px_24px_rgba(0,74,198,0.3)]`

Update filter button classes. Replace any `bg-blue-*` / `bg-gray-*` with:
- Active filter: `bg-primary-container text-on-primary-container font-label text-[0.875rem] font-medium rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(23,28,31,0.06)]`
- Inactive filter: `bg-surface-container-high text-on-surface font-label text-[0.875rem] font-medium rounded-full px-4 py-2 hover:bg-surface-variant transition-colors`

Replace any `text-gray-500` → `text-on-surface-variant`, `text-gray-900` → `text-on-surface`.

- [ ] **Step 2: Add FAB button if not present**

Add before closing `</main>` or at page level:

```tsx
<button
  onClick={() => setShowForm(true)}
  className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-[0_8px_24px_rgba(0,74,198,0.3)] flex justify-center items-center active:scale-95 transition-transform z-40"
>
  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
</button>
```

- [ ] **Step 3: Verify rooms page matches Stitch**

Compare with `stitch_vietroom_manager/danh_s_ch_ph_ng_mobile_room_manager/screen.png`. Check: filter pills, room cards, FAB button.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/app/\(app\)/\(dashboard\)/rooms/page.tsx
git commit -m "feat(design): restyle rooms page with Stitch filter pills and gradient FAB"
```

---

## Task 10: Dashboard Page Redesign

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Restyle dashboard to match Stitch design**

This is the largest single-screen change. Key sections from Stitch:

**A. Welcome area:**
```tsx
<div className="py-6">
  <h1 className="font-headline text-[1.5rem] font-bold text-on-surface">
    Chào buổi sáng, {userName} 👋
  </h1>
  <p className="font-body text-sm text-on-surface-variant mt-1">
    Đây là tình hình hoạt động của các khu trọ hôm nay.
  </p>
</div>
```

**B. Announcement banner:**
```tsx
<div className="mb-6 bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between shadow-ambient relative overflow-hidden group cursor-pointer">
  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent z-0" />
  <div className="relative z-10 flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary-container">
      <span className="material-symbols-outlined">campaign</span>
    </div>
    <div>
      <h3 className="font-headline font-semibold text-on-surface text-sm">Cập nhật hệ thống mới</h3>
      <p className="font-body text-xs text-on-surface-variant mt-0.5">Trải nghiệm ghi điện nước nhanh hơn</p>
    </div>
  </div>
  <button className="relative z-10 text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded-full transition-colors">
    <span className="material-symbols-outlined text-sm">arrow_forward</span>
  </button>
</div>
```

**C. Quick actions row:**
```tsx
<div className="mb-8">
  <div className="flex overflow-x-auto gap-4 pb-4" style={{ scrollbarWidth: 'none' }}>
    {[
      { icon: 'add_circle', label: 'Thêm\nphòng', primary: true },
      { icon: 'bolt', label: 'Ghi\nđiện nước', primary: false },
      { icon: 'receipt', label: 'Tạo\nhóa đơn', primary: false },
    ].map((action, i) => (
      <button key={i} className="flex-none w-24 flex flex-col items-center gap-2 group">
        <div className={cn(
          "w-14 h-14 rounded-[1rem] flex items-center justify-center group-active:scale-95 transition-transform",
          action.primary
            ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-md"
            : "bg-surface-container-lowest text-primary shadow-ambient-sm"
        )}>
          <span className="material-symbols-outlined" style={action.primary ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {action.icon}
          </span>
        </div>
        <span className="font-body text-xs font-medium text-on-surface-variant text-center leading-tight whitespace-pre-line">
          {action.label}
        </span>
      </button>
    ))}
  </div>
</div>
```

**D. 2x2 Bento stats grid:**
```tsx
<div className="mb-8">
  <h2 className="font-headline font-semibold text-[1.125rem] text-on-surface mb-4">Tổng quan tháng này</h2>
  <div className="grid grid-cols-2 gap-4">
    {/* Each stat card */}
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient-sm border-ghost relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-sm">payments</span>
        </div>
      </div>
      <div>
        <div className="font-body text-xs text-on-surface-variant mb-1">Doanh thu dự kiến</div>
        <div className="font-headline text-lg font-bold text-on-surface tracking-tight">
          45.5<span className="text-sm font-normal text-on-surface-variant ml-0.5">Tr</span>
        </div>
      </div>
    </div>
    {/* Repeat for: Đang nợ (error colors), Phòng trống, Sắp hết HĐ */}
  </div>
</div>
```

**E. Attention list:**
Replace any `bg-white` → `bg-surface-container-lowest`, `text-gray-*` → surface tokens, left accent bars with status-semantic colors.

Apply all these patterns to the existing dashboard page, replacing current hero gradient card and stats sections.

- [ ] **Step 2: Verify dashboard matches Stitch screenshot**

Compare with `stitch_vietroom_manager/t_ng_quan_mobile_room_manager/screen.png`. Check: greeting, banner, quick actions, bento grid, attention list.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/\(app\)/\(dashboard\)/dashboard/page.tsx
git commit -m "feat(design): redesign dashboard with Stitch bento stats and quick actions"
```

---

## Task 11: Register Form Redesign

**Files:**
- Modify: `packages/frontend/src/components/auth/register-form.tsx`

- [ ] **Step 1: Restyle register form to match Stitch design**

Key changes matching `stitch_vietroom_manager/ng_k_mobile_room_manager/screen.png`:
- Title: `font-headline text-[2.25rem] font-bold text-primary` (display-sm token)
- Subtitle: `font-body text-[0.875rem] text-on-surface-variant`
- Input fields: `bg-surface-container-low rounded-xl px-4 py-3` with Material Symbols icons
- Labels: `font-label text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider`
- Submit button: gradient `bg-gradient-to-r from-primary to-primary-container` with shadow
- Password toggle: `text-outline`
- Terms text: `font-label text-[0.6875rem] text-on-surface-variant`
- Footer: "Đã có tài khoản? Đăng nhập ngay" link

Apply same token replacements as login form: all `gray-*` → surface tokens, `blue-*` → primary tokens.

- [ ] **Step 2: Verify register page matches Stitch**

Compare with `stitch_vietroom_manager/ng_k_mobile_room_manager/screen.png`.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/auth/register-form.tsx
git commit -m "feat(design): redesign register form with Stitch Modern Sanctuary style"
```

---

## Task 12: Onboarding Wizard Redesign

**Files:**
- Modify: `packages/frontend/src/components/auth/onboarding-wizard.tsx`

- [ ] **Step 1: Restyle onboarding wizard to match Stitch design**

Two Stitch screens to reference:
- Step 1 (`thi_t_l_p_khu_tr`): Property name + address setup
- Step 2 (`th_m_ph_ng_u_ti_n`): Add first room with toggles

Key patterns:
- Step indicator: dots at top (`w-2 h-2 rounded-full`, active = `bg-primary`, inactive = `bg-surface-variant`, current step stretched = `w-8`)
- "Bỏ qua" skip button: `text-primary font-medium text-sm`
- Page title: `font-headline text-3xl font-bold text-on-surface tracking-tight`
- Accent text: `text-primary` for emphasis
- Input cards: `bg-surface-container-lowest p-6 rounded-xl shadow-ambient-sm border-ghost` with left accent bar (`w-1 bg-surface-container-high` → `bg-primary` on focus)
- Labels inside cards: `font-headline text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider`
- Input icons: Material Symbols (`door_front`, `layers`, `payments`, `apartment`, `location_on`)
- Toggle switches: peer-checked → `bg-primary` or `bg-error`
- CTA: gradient button same as login
- "Bỏ qua bước này" secondary action: `text-primary font-body hover:bg-primary/5`

Apply these patterns to each onboarding step.

- [ ] **Step 2: Verify onboarding flow matches Stitch**

Walk through onboarding steps, compare with both Stitch screenshots.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/auth/onboarding-wizard.tsx
git commit -m "feat(design): redesign onboarding wizard with Stitch tonal cards and step indicators"
```

---

## Task 13: Room Detail Page Redesign

**Files:**
- Check if exists: `packages/frontend/src/app/(app)/(dashboard)/rooms/[id]/page.tsx`
- Modify: Room detail popup/page component

- [ ] **Step 1: Find and update room detail component**

First check which component renders room detail — it may be `RoomDetailPopup` (popup-based) or a dedicated page. Apply Stitch patterns from `stitch_vietroom_manager/chi_ti_t_ph_ng_mobile_room_manager/screen.png`:

- Contextual header: back button (`bg-surface-container-low rounded-full`), room name (`font-headline`), status badge
- Key stats bento: 2-column grid with left accent bars (primary = rent, tertiary = contract)
- Tab navigation: pill buttons (`bg-primary text-on-primary` active, `bg-surface-container-low text-on-surface-variant` inactive)
- Tenant cards: `bg-surface-container-lowest rounded-xl shadow-ambient` with avatar, name, phone, CCCD
- Action buttons: "Gọi điện" / "Nhắn tin" in `bg-surface-container-low text-primary rounded-lg`
- "Đại diện" badge: `bg-primary-fixed text-on-primary-fixed` pill

- [ ] **Step 2: Verify room detail matches Stitch**

Compare with `stitch_vietroom_manager/chi_ti_t_ph_ng_mobile_room_manager/screen.png`.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/rooms/ packages/frontend/src/app/\(app\)/\(dashboard\)/rooms/
git commit -m "feat(design): redesign room detail with Stitch bento stats and tenant cards"
```

---

## Task 14: Global Cleanup — Remaining Gray References

**Files:**
- Multiple files across `packages/frontend/src/`

- [ ] **Step 1: Search and replace remaining gray/blue Tailwind references**

Run grep to find all remaining `gray-` and `blue-` color references in components:

```bash
cd /Users/comchientrung/company/room-manager
grep -rn "text-gray-\|bg-gray-\|border-gray-\|text-blue-\|bg-blue-\|border-blue-" packages/frontend/src/components/ packages/frontend/src/app/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next"
```

For each file, apply these mappings:
- `gray-50` → `surface-container-low`
- `gray-100` → `surface-container` or `outline-variant/15`
- `gray-200` → `surface-container-high`
- `gray-400` → `on-surface-variant` (for text) or `outline` (for borders)
- `gray-500` → `on-surface-variant`
- `gray-700` → `on-surface`
- `gray-900` → `on-surface`
- `blue-50` → `primary-fixed`
- `blue-100` → `primary-fixed`
- `blue-200` → `primary-fixed-dim`
- `blue-400` → `primary-container`
- `blue-500` → `primary-container`
- `blue-600` → `primary`
- `red-50` → `error-container`
- `red-500` → `error`
- `red-600` → `on-error-container`
- `emerald-*` → `secondary-fixed` / `on-secondary-fixed`
- `amber-*` → `tertiary-fixed` / `on-tertiary-fixed`
- `bg-white` → `bg-surface-container-lowest`

- [ ] **Step 2: Verify no visual regressions**

Navigate through all main screens (login, register, dashboard, rooms, settings, invoices). Confirm consistent color language throughout.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/
git commit -m "feat(design): replace all Tailwind gray/blue colors with Material Design 3 surface tokens"
```

---

## Task 15: Final Visual QA

- [ ] **Step 1: Side-by-side comparison**

Open each Stitch screenshot alongside the running app:
1. Login → `ng_nh_p_mobile_room_manager/screen.png`
2. Register → `ng_k_mobile_room_manager/screen.png`
3. Onboarding Step 1 → `thi_t_l_p_khu_tr_mobile_room_manager/screen.png`
4. Onboarding Step 2 → `th_m_ph_ng_u_ti_n_mobile_room_manager/screen.png`
5. Dashboard → `t_ng_quan_mobile_room_manager/screen.png`
6. Room list → `danh_s_ch_ph_ng_mobile_room_manager/screen.png`
7. Room detail → `chi_ti_t_ph_ng_mobile_room_manager/screen.png`

- [ ] **Step 2: Fix any discrepancies found**

Common things to check:
- Font sizes match Stitch type scale
- Spacing/margins consistent
- Shadow intensities correct
- No hard borders visible (no-line rule)
- Currency formatting: right-aligned, "đ" smaller/lighter
- Status badge colors semantically correct

- [ ] **Step 3: Final commit**

```bash
git add packages/frontend/src/
git commit -m "fix(design): visual QA adjustments for Stitch design system alignment"
```
