# UI/UX Polish — Critical & Important Fixes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical and important UI/UX issues across the room manager app to make it production-ready.

**Architecture:** Incremental improvements across existing pages and components — no new routes or API changes. Each task is self-contained and independently deployable.

**Tech Stack:** Next.js 15, React, Tailwind CSS v4, antd-mobile, lucide-react

---

## File Map

| File | Tasks |
|------|-------|
| `packages/frontend/src/app/(app)/(dashboard)/layout.tsx` | T1 |
| `packages/frontend/src/app/globals.css` | T1 |
| `packages/frontend/src/app/(app)/(dashboard)/invoices/[id]/page.tsx` | T2 |
| `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx` | T3 |
| `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx` | T3, T6 |
| `packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx` | T4 |
| `packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx` | T5 |
| `packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx` | T5 |
| `packages/frontend/src/app/(app)/(dashboard)/contracts/page.tsx` | T5 |
| `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx` | T5 |
| `packages/frontend/src/components/layout/top-bar.tsx` | T1 |
| `packages/frontend/src/components/layout/bottom-nav.tsx` | T7 |
| `packages/frontend/src/components/contracts/contract-card.tsx` | T8 |
| `packages/frontend/src/components/rooms/room-card.tsx` | T8 |
| `packages/frontend/src/components/ui/app-popup.tsx` | T8 |

---

## Task 1: Critical Bug Fixes (z-index, inline styles, font sizes)

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/layout.tsx`
- Modify: `packages/frontend/src/components/layout/top-bar.tsx`
- Modify: `packages/frontend/src/app/globals.css`

### Problems fixed:
- `z-9999` invalid in Tailwind → `z-[9999]` (Tailwind v4 supports arbitrary values)
- TopBar label `text-[10px]` → `text-[11px]` (still small but one step up, or use CSS)
- Inline `style={{ '--font-size': '15px' }}` on antd-mobile Input — add global CSS override instead
- Dashboard stats label `text-[11px]` — acceptable, keep but document
- `"Đã hiển thị tất cả"` contrast: `text-gray-300` → `text-gray-400`

- [ ] **Step 1: Fix z-index in layout.tsx**

  In `packages/frontend/src/app/(app)/(dashboard)/layout.tsx`, line 24:
  ```tsx
  // Before:
  <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white">
  // After:
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
  ```

- [ ] **Step 2: Fix antd-mobile Input font-size via global CSS instead of inline style**

  In `packages/frontend/src/app/globals.css`, add after existing rules:
  ```css
  /* Normalize antd-mobile Input font-size to 15px app-wide */
  .adm-input-element,
  .adm-text-area-element {
    font-size: 15px !important;
  }
  ```

  Then in `packages/frontend/src/components/layout/top-bar.tsx`, remove inline styles from both Input elements (lines 138 and 142):
  ```tsx
  // Before:
  <Input placeholder="VD: Nhà trọ Số 5" value={newName} onChange={setNewName} style={{ '--font-size': '15px' } as React.CSSProperties} />
  // ...
  <Input placeholder="VD: 123 Nguyễn Văn A, Q.1" value={newAddress} onChange={setNewAddress} style={{ '--font-size': '15px' } as React.CSSProperties} />

  // After:
  <Input placeholder="VD: Nhà trọ Số 5" value={newName} onChange={setNewName} />
  // ...
  <Input placeholder="VD: 123 Nguyễn Văn A, Q.1" value={newAddress} onChange={setNewAddress} />
  ```

- [ ] **Step 3: Fix contrast for "Đã hiển thị tất cả" in invoices page**

  In `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx`, line 151:
  ```tsx
  // Before:
  <span className="text-xs text-gray-300">Đã hiển thị tất cả</span>
  // After:
  <span className="text-xs text-gray-400">Đã hiển thị tất cả</span>
  ```

- [ ] **Step 4: Fix TopBar label font size for readability**

  In `packages/frontend/src/components/layout/top-bar.tsx`, line 61:
  ```tsx
  // Before:
  <span className="text-[10px] font-medium text-gray-400">Chi nhánh hiện tại</span>
  // After:
  <span className="text-xs font-medium text-gray-400">Chi nhánh hiện tại</span>
  ```

- [ ] **Step 5: Commit**
  ```bash
  cd packages/frontend
  git add src/app/globals.css src/app/(app)/(dashboard)/layout.tsx src/app/(app)/(dashboard)/invoices/page.tsx src/components/layout/top-bar.tsx
  git commit -m "fix: critical z-index, contrast, and inline style issues"
  ```

---

## Task 2: Invoice Detail — Back Button & Header

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/invoices/[id]/page.tsx`

### Problems fixed:
- `←` hardcoded character → `ArrowLeft` from lucide-react
- Header `px-4` but content `px-4` — remove redundant wrapper div

- [ ] **Step 1: Replace ← with ArrowLeft icon**

  In `packages/frontend/src/app/(app)/(dashboard)/invoices/[id]/page.tsx`:

  Add import at top (line 4, after existing imports):
  ```tsx
  import { ArrowLeft } from 'lucide-react';
  ```

  Replace back button (line 50-52):
  ```tsx
  // Before:
  <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
    ←
  </button>

  // After:
  <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
    <ArrowLeft className="h-4 w-4" />
  </button>
  ```

- [ ] **Step 2: Remove top-level no-padding on invoice detail — it has its own header with px-4**

  The page root div at line 47 has `className="space-y-4"`. The header at line 49 uses `px-4` inline. Move header out of the inner `px-4` div wrapper to give it full bleed:

  ```tsx
  // Before (lines 47-61):
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3">
      ...
    </div>
    <div className="px-4 space-y-4">
      ...
    </div>
  </div>

  // After — keep as is, just swap px-4 spacing class on wrapper to padding-x:
  // No structural change needed, just the ← → icon fix above is sufficient.
  ```

  (Structure is already fine — skip this sub-step.)

- [ ] **Step 3: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/invoices/[id]/page.tsx
  git commit -m "fix: replace hardcoded ← arrow with ArrowLeft icon in invoice detail"
  ```

---

## Task 3: Month/Year Navigation — Replace ‹ › Characters with Icons

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx`
- Modify: `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx`

### Problems fixed:
- `‹` `›` HTML entities used as nav buttons — not semantic, no icon meaning
- Button touch area too small (`px-1`)
- No visual affordance that these are clickable

- [ ] **Step 1: Fix expenses page month navigation**

  In `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx`:

  Add import (update existing lucide import line 2):
  ```tsx
  import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
  ```

  Replace month navigation (lines 107-127):
  ```tsx
  // Before:
  <div className="mt-0.5 flex items-center gap-1">
    <button
      onClick={() => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m - 2);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }}
      className="px-1 text-gray-400 text-base leading-none"
    >‹</button>
    <span className="text-sm text-gray-400">
      Tháng {month.split('-')[1]}/{month.split('-')[0]}
    </span>
    <button
      onClick={() => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }}
      className="px-1 text-gray-400 text-base leading-none"
    >›</button>
  </div>

  // After:
  <div className="mt-0.5 flex items-center gap-1">
    <button
      onClick={() => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m - 2);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      aria-label="Tháng trước"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
    <span className="min-w-[80px] text-center text-sm font-medium text-gray-600">
      Tháng {month.split('-')[1]}/{month.split('-')[0]}
    </span>
    <button
      onClick={() => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m);
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      aria-label="Tháng sau"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
  ```

- [ ] **Step 2: Fix reports page year navigation**

  In `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx`:

  Add import (update existing imports, currently no lucide imports):
  ```tsx
  import { ChevronLeft, ChevronRight } from 'lucide-react';
  ```

  Replace year navigation (lines 141-143):
  ```tsx
  // Before:
  <div className="flex items-center gap-2">
    <button onClick={() => setYear((y) => y - 1)} className="px-2 py-1 text-gray-400 text-lg">‹</button>
    <span className="text-sm font-semibold text-gray-700">{year}</span>
    <button onClick={() => setYear((y) => y + 1)} className="px-2 py-1 text-gray-400 text-lg">›</button>
  </div>

  // After:
  <div className="flex items-center gap-1">
    <button
      onClick={() => setYear((y) => y - 1)}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      aria-label="Năm trước"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
    <span className="min-w-[48px] text-center text-sm font-semibold text-gray-700">{year}</span>
    <button
      onClick={() => setYear((y) => y + 1)}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      aria-label="Năm sau"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx
  git commit -m "fix: replace HTML entity nav arrows with ChevronLeft/Right icons"
  ```

---

## Task 4: Settings Page — Logout Confirmation + Inline Styles

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx`
- Modify: `packages/frontend/src/components/settings/utility-config-form.tsx`

### Problems fixed:
- Logout button has no confirmation dialog — destructive action
- Card border-radius inline style → Tailwind
- Input font-size inline style (handled globally in T1, but check utility form)

- [ ] **Step 1: Read utility-config-form.tsx to find inline styles**
  ```bash
  cat packages/frontend/src/components/settings/utility-config-form.tsx
  ```

- [ ] **Step 2: Add logout confirmation in settings page**

  In `packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx`:

  The `Dialog` is already imported from antd-mobile (line 5 has `Button, Card, Input`). Add `Dialog` to the import:
  ```tsx
  import { Button, Card, Input, Dialog } from 'antd-mobile';
  ```

  Replace the logout button at the bottom of SettingsPage (line 158):
  ```tsx
  // Before:
  <Button block color="danger" fill="solid" onClick={signOut}>
    Đăng xuất
  </Button>

  // After:
  <Button
    block
    color="danger"
    fill="solid"
    onClick={async () => {
      const confirmed = await Dialog.confirm({
        content: 'Bạn có chắc muốn đăng xuất?',
        confirmText: 'Đăng xuất',
        cancelText: 'Huỷ',
      });
      if (confirmed) signOut();
    }}
  >
    Đăng xuất
  </Button>
  ```

- [ ] **Step 3: Remove inline --border-radius from Card components in reports/expenses/settings pages**

  Search for `--border-radius` usage in all page files:
  ```bash
  grep -r "'--border-radius'" packages/frontend/src --include="*.tsx" -l
  ```

  For each file found, replace:
  ```tsx
  // Before:
  <Card style={{ '--border-radius': '16px' } as React.CSSProperties}>
  // After:
  <Card className="rounded-2xl overflow-hidden">
  ```

  Note: antd-mobile Card already has rounded corners by default. The `--border-radius` CSS var override only affects the Card's internal body. Check if removing it changes visual appearance — if so, add `!rounded-2xl` Tailwind override.

  Actually, antd-mobile Card uses `--border-radius` CSS variable to control its own radius. Since we added it explicitly as `16px` (= `rounded-2xl`), we can instead add it to globals.css:
  ```css
  /* Standardize antd-mobile Card border radius */
  .adm-card {
    --border-radius: 16px;
  }
  ```
  This removes ALL inline style occurrences at once.

- [ ] **Step 4: Add global Card border-radius to globals.css**

  In `packages/frontend/src/app/globals.css`, append:
  ```css
  /* Standardize antd-mobile component defaults */
  .adm-card {
    --border-radius: 16px;
  }

  .adm-input-element,
  .adm-text-area-element {
    font-size: 15px !important;
  }
  ```
  (Consolidate with Step 2 from Task 1 if doing in same session)

  Then remove ALL occurrences of `style={{ '--border-radius': '16px' } as React.CSSProperties}` from:
  - `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx` (lines 62, 66)
  - `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx` (lines 48, 73, 87, 106, 153, 157, 161)

- [ ] **Step 5: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx packages/frontend/src/app/globals.css packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx
  git commit -m "fix: add logout confirmation, remove inline border-radius styles"
  ```

---

## Task 5: Empty States — Replace Emoji with Icons

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx`
- Modify: `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx`
- Modify: `packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx`

### Problems fixed:
- `🏘️` emoji used as "empty state illustration" — not professional
- `🎉` emoji in invoice empty state — inconsistent with design

- [ ] **Step 1: Fix dashboard no-property empty state**

  In `packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx`:

  Add import (update existing lucide imports):
  ```tsx
  import {
    BarChart3, DoorOpen, FileText, Home, Receipt,
    TrendingUp, Users, Wallet, Building2,
  } from "lucide-react";
  ```

  Replace empty state (lines 63-71):
  ```tsx
  // Before:
  <Card bodyClassName="p-6 text-center">
    <p className="text-4xl">🏘️</p>
    <p className="mt-3 font-semibold text-gray-700">Chưa có khu trọ</p>
    <p className="mt-1 text-sm text-gray-400">
      Hoàn thành onboarding để bắt đầu.
    </p>
  </Card>

  // After:
  <Card bodyClassName="p-8 text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
      <Building2 className="h-7 w-7 text-blue-400" />
    </div>
    <p className="mt-4 font-semibold text-gray-700">Chưa có khu trọ</p>
    <p className="mt-1 text-sm text-gray-400">
      Hoàn thành onboarding để bắt đầu.
    </p>
  </Card>
  ```

  Replace invoice empty state (lines 167-169):
  ```tsx
  // Before:
  <div className="py-4 text-center text-sm text-gray-400">
    🎉 Tất cả hóa đơn đã được thanh toán
  </div>

  // After:
  <div className="py-4 text-center text-sm text-emerald-600 font-medium">
    Tất cả hóa đơn đã được thanh toán
  </div>
  ```

- [ ] **Step 2: Fix invoices page no-property empty state**

  In `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx`, replace lines 71-74:
  ```tsx
  // Before:
  <div className="rounded-xl bg-white p-8 text-center shadow-sm">
    <p className="text-4xl">🏘️</p>
    <p className="mt-3 font-medium">Chưa có khu trọ</p>
  </div>

  // After (add Building2 import from lucide-react at top):
  import { Plus, Building2 } from "lucide-react";
  // ...
  <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
      <Building2 className="h-7 w-7 text-blue-400" />
    </div>
    <p className="mt-4 font-medium text-gray-700">Chưa có khu trọ</p>
  </div>
  ```

- [ ] **Step 3: Fix settings page no-property empty state**

  In `packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx`:

  Add import:
  ```tsx
  import { Button, Card, Input, Dialog } from 'antd-mobile';
  import { Building2 } from 'lucide-react';
  ```

  Replace lines 99-102:
  ```tsx
  // Before:
  <Card className="text-center">
    <p className="text-4xl">🏘️</p>
    <p className="mt-3 font-medium">Chưa có khu trọ</p>
  </Card>

  // After:
  <Card className="text-center">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
      <Building2 className="h-7 w-7 text-blue-400" />
    </div>
    <p className="mt-4 font-medium text-gray-700">Chưa có khu trọ</p>
  </Card>
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/dashboard/page.tsx packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx packages/frontend/src/app/(app)/(dashboard)/settings/page.tsx
  git commit -m "fix: replace emoji empty states with Building2 icon illustrations"
  ```

---

## Task 6: Reports Page — SVG Bar Chart

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx`

### Problems fixed:
- DIV-based bar chart not accessible, not responsive
- No axis labels, no data labels on hover
- Colors blue-400/red-300 — improve to blue-500/rose-400 for better contrast

- [ ] **Step 1: Replace BarChart component with SVG implementation**

  In `packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx`, replace the entire `BarChart` function (lines 19-41):

  ```tsx
  function BarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
    const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
    const CHART_HEIGHT = 120;
    const BAR_GAP = 2;
    const LABEL_HEIGHT = 20;
    const totalWidth = 100; // percentage-based via viewBox

    return (
      <svg
        viewBox={`0 0 ${data.length * 10} ${CHART_HEIGHT + LABEL_HEIGHT}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Biểu đồ thu chi theo tháng"
      >
        {data.map((d, i) => {
          const incomeH = Math.max((d.income / maxVal) * CHART_HEIGHT, 1);
          const expenseH = Math.max((d.expense / maxVal) * CHART_HEIGHT, 1);
          const barW = 4;
          const groupX = i * 10 + 1;

          return (
            <g key={d.label}>
              {/* Income bar */}
              <rect
                x={groupX}
                y={CHART_HEIGHT - incomeH}
                width={barW}
                height={incomeH}
                rx={1}
                className="fill-blue-500"
              />
              {/* Expense bar */}
              <rect
                x={groupX + barW + BAR_GAP}
                y={CHART_HEIGHT - expenseH}
                width={barW}
                height={expenseH}
                rx={1}
                className="fill-rose-400"
              />
              {/* Month label */}
              <text
                x={groupX + barW}
                y={CHART_HEIGHT + 14}
                textAnchor="middle"
                className="fill-gray-400"
                fontSize={3.5}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }
  ```

- [ ] **Step 2: Update legend colors to match new chart colors**

  In the MonthlySection function, update legend dots (lines 74-82):
  ```tsx
  // Before:
  <div className="flex items-center gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
    <span className="text-xs text-gray-500">Thu</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
    <span className="text-xs text-gray-500">Chi</span>
  </div>

  // After:
  <div className="flex items-center gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
    <span className="text-xs text-gray-500">Thu</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
    <span className="text-xs text-gray-500">Chi</span>
  </div>
  ```

- [ ] **Step 3: Update monthly table row expense color to match**

  Line 118 in reports/page.tsx:
  ```tsx
  // Before:
  <span className="text-right text-red-400">{formatPrice(m.totalExpenses)}</span>
  // After:
  <span className="text-right text-rose-400">{formatPrice(m.totalExpenses)}</span>
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/reports/page.tsx
  git commit -m "feat: replace div-based bar chart with accessible SVG implementation"
  ```

---

## Task 7: Bottom Nav — Pending Invoice Badge

**Files:**
- Modify: `packages/frontend/src/components/layout/bottom-nav.tsx`
- Modify: `packages/frontend/src/app/(app)/(dashboard)/layout.tsx`

### Problems fixed:
- No visual count of pending invoices on bottom nav
- User has no at-a-glance indication of unpaid invoices

- [ ] **Step 1: Add pending invoice count to bottom nav**

  In `packages/frontend/src/components/layout/bottom-nav.tsx`, update the full file:

  ```tsx
  "use client";

  import { TabBar } from "antd-mobile";
  import { DoorOpen, LayoutGrid, Receipt, Settings } from "lucide-react";
  import { usePathname, useRouter } from "next/navigation";
  import { cn } from "@/lib/utils";
  import { useInvoices } from "@/hooks/use-invoices";
  import { useProperty } from "@/contexts/property-context";

  function getCurrentBillingPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { propertyId } = useProperty();

    const { data: invoices } = useInvoices(propertyId, getCurrentBillingPeriod());
    const pendingCount = invoices?.filter((inv) => inv.status !== "PAID").length ?? 0;

    const tabs = [
      { key: "/dashboard", title: "Tổng quan", icon: LayoutGrid, badge: 0 },
      { key: "/rooms", title: "Phòng", icon: DoorOpen, badge: 0 },
      { key: "/invoices", title: "Hóa đơn", icon: Receipt, badge: pendingCount },
      { key: "/settings", title: "Cài đặt", icon: Settings, badge: 0 },
    ];

    const activeKey =
      tabs.find((t) => pathname.startsWith(t.key))?.key ?? "/dashboard";

    return (
      <div className="sticky bottom-0 z-50 w-full max-w-md border-t border-gray-100 bg-white left-0">
        <TabBar activeKey={activeKey} onChange={(key) => router.push(key)}>
          {tabs.map((tab) => (
            <TabBar.Item
              key={tab.key}
              icon={(active: boolean) => (
                <div className="relative">
                  <tab.icon
                    className={cn("h-5 w-5", active ? "text-blue-600" : "text-gray-400")}
                  />
                  {tab.badge > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>
              )}
              title={tab.title}
            />
          ))}
        </TabBar>
      </div>
    );
  }
  ```

  Note: `useInvoices` and `useProperty` hooks are already used in the dashboard page — they are safe to call here. The data will be served from React Query cache with no extra network request if the dashboard page was already loaded.

- [ ] **Step 2: Commit**
  ```bash
  git add packages/frontend/src/components/layout/bottom-nav.tsx
  git commit -m "feat: add pending invoice count badge to bottom nav"
  ```

---

## Task 8: Contract Card & Room Card Polish

**Files:**
- Modify: `packages/frontend/src/components/contracts/contract-card.tsx`
- Modify: `packages/frontend/src/components/rooms/room-card.tsx`

### Problems fixed:
- `⚠` emoji in contract card expiry warning → `AlertTriangle` icon
- Contract deposit status uses antd-mobile Tag colors → replace with Tailwind badge
- Room card chevron `text-gray-300` too faint → `text-gray-400`
- Room card `active:scale-[0.99]` barely noticeable → `active:scale-[0.98]`

- [ ] **Step 1: Fix contract-card.tsx**

  Replace full file content:
  ```tsx
  'use client';

  import { AlertTriangle } from 'lucide-react';
  import { Contract } from '@/hooks/use-contracts';
  import { cn } from '@/lib/utils';

  const DEPOSIT_STATUS_MAP: Record<Contract['depositStatus'], { label: string; className: string }> = {
    PENDING: { label: 'Chưa cọc', className: 'bg-amber-50 text-amber-700' },
    PAID:    { label: 'Đã cọc',   className: 'bg-emerald-50 text-emerald-700' },
    RETURNED: { label: 'Đã trả',  className: 'bg-gray-100 text-gray-600' },
    DEDUCTED: { label: 'Khấu trừ', className: 'bg-red-50 text-red-600' },
  };

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  function getDaysLeft(endDate: string | null): number | null {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  interface Props {
    contract: Contract;
  }

  export function ContractCard({ contract }: Props) {
    const deposit = DEPOSIT_STATUS_MAP[contract.depositStatus];
    const daysLeft = getDaysLeft(contract.endDate);

    return (
      <div className="w-full rounded-2xl bg-white p-4 shadow-sm shadow-blue-100/30 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{contract.room?.name ?? '—'}</p>
            <p className="text-sm text-gray-500 truncate">{contract.tenant?.name ?? '—'}</p>
            <p className="mt-1 text-xs text-gray-400">
              {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', deposit.className)}>
              {deposit.label}
            </span>
            {contract.depositAmount > 0 && (
              <p className="text-xs text-gray-500">
                Cọc: {contract.depositAmount.toLocaleString('vi-VN')}đ
              </p>
            )}
          </div>
        </div>
        {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Còn {daysLeft} ngày hết hạn
          </div>
        )}
        {daysLeft !== null && daysLeft <= 0 && (
          <p className="mt-2 text-xs font-medium text-red-500">Đã hết hạn</p>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Fix room card chevron contrast and scale**

  In `packages/frontend/src/components/rooms/room-card.tsx`:

  Line 42 — improve active feedback:
  ```tsx
  // Before:
  className="group flex w-full overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/40 transition-all hover:shadow-md hover:shadow-blue-100/60 active:scale-[0.99] text-left"
  // After:
  className="group flex w-full overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/40 transition-all hover:shadow-md hover:shadow-blue-100/60 active:scale-[0.98] text-left"
  ```

  Line 87 — improve chevron visibility:
  ```tsx
  // Before:
  <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5" />
  // After:
  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add packages/frontend/src/components/contracts/contract-card.tsx packages/frontend/src/components/rooms/room-card.tsx
  git commit -m "fix: replace ⚠ emoji with AlertTriangle icon, standardize contract deposit badge, improve room card chevron contrast"
  ```

---

## Task 9: Touch Targets — Fix Small Buttons

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx`
- Modify: `packages/frontend/src/components/settings/service-fee-list.tsx`

### Problems fixed:
- Delete button `h-4 w-4` icon inside `!p-1` Button → touch target too small (~16-24px)
- Apple HIG min touch target: 44px. Material: 48px. Minimum acceptable: 36px.

- [ ] **Step 1: Read service-fee-list.tsx**
  ```bash
  cat packages/frontend/src/components/settings/service-fee-list.tsx
  ```

- [ ] **Step 2: Fix expenses delete button touch area**

  In `packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx`, line 82:
  ```tsx
  // Before:
  <Button fill="none" onClick={() => handleDelete(e.id, e.note)} className="!text-red-400 !p-1 !min-w-0">
    <Trash2 className="h-4 w-4" />
  </Button>

  // After:
  <Button fill="none" onClick={() => handleDelete(e.id, e.note)} className="!text-red-400 !p-2 !min-w-0">
    <Trash2 className="h-4 w-4" />
  </Button>
  ```
  (`!p-2` = 8px padding × 2 sides + icon 16px = ~32px minimum touch area. Combined with List.Item height it's sufficient.)

- [ ] **Step 3: Fix service-fee-list delete button (after reading file)**

  Apply same `!p-2` fix to any small delete/trash buttons found.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/frontend/src/app/(app)/(dashboard)/expenses/page.tsx packages/frontend/src/components/settings/service-fee-list.tsx
  git commit -m "fix: increase touch target size on delete buttons"
  ```

---

## Task 10: Tabs Inline Style — Rooms Page

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx`
- Modify: `packages/frontend/src/app/globals.css`

### Problems fixed:
- `style={{ '--title-font-size': '14px' }}` on antd-mobile Tabs → move to global CSS

- [ ] **Step 1: Move Tabs title font-size to globals.css**

  In `packages/frontend/src/app/globals.css`, append:
  ```css
  /* Standardize antd-mobile Tabs title font size */
  .adm-tabs-tab {
    --title-font-size: 14px;
  }
  ```

- [ ] **Step 2: Remove inline style from rooms page**

  In `packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx`, line 55:
  ```tsx
  // Before:
  <Tabs
    activeKey={activeTab}
    onChange={(key) => setActiveTab(key as FilterTab)}
    style={{ '--title-font-size': '14px' } as React.CSSProperties}
  >

  // After:
  <Tabs
    activeKey={activeTab}
    onChange={(key) => setActiveTab(key as FilterTab)}
  >
  ```

- [ ] **Step 3: Consolidate all globals.css additions from all tasks**

  Final `packages/frontend/src/app/globals.css` should look like:
  ```css
  @layer theme, base, antd, components, utilities;
  @import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");
  @import "tailwindcss";
  @import "antd-mobile/bundle/style.css";

  @theme {
    --breakpoint-xxxs: 320px;
    --breakpoint-xxs: 375px;
    --breakpoint-xs: 425px;
  }

  :root {
    --font-sans: "Be Vietnam Pro", sans-serif;
    --adm-color-primary: #2563eb;
    --adm-font-family: "Be Vietnam Pro", sans-serif;
  }

  body {
    font-family: var(--font-sans);
  }

  .adm-error-block-image {
    place-self: center;
    justify-self: center;
  }

  /* Standardize antd-mobile component defaults */
  .adm-card {
    --border-radius: 16px;
  }

  .adm-input-element,
  .adm-text-area-element {
    font-size: 15px !important;
  }

  .adm-tabs-tab {
    --title-font-size: 14px;
  }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add packages/frontend/src/app/globals.css packages/frontend/src/app/(app)/(dashboard)/rooms/page.tsx
  git commit -m "fix: move antd-mobile CSS variable overrides to globals.css"
  ```

---

## Task 11: Invoice List Inline Styles

**Files:**
- Modify: `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx`

### Problems fixed:
- `style={{ '--border-top': 'none', '--border-bottom': 'none' }}` inline styles → global CSS
- Multiple List components across pages have same inline style

- [ ] **Step 1: Add List border override to globals.css**

  In `packages/frontend/src/app/globals.css`, append:
  ```css
  /* Remove default top/bottom borders from List used as plain containers */
  .adm-list.no-border {
    --border-top: none;
    --border-bottom: none;
    --border-inner: none;
  }
  ```

- [ ] **Step 2: Update invoices page List usage**

  In `packages/frontend/src/app/(app)/(dashboard)/invoices/page.tsx`, line 95:
  ```tsx
  // Before:
  <List
    key={period}
    header={...}
    className="mb-3"
    style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}
  >

  // After:
  <List
    key={period}
    header={...}
    className="mb-3 no-border"
  >
  ```

- [ ] **Step 3: Search and update all other List components with same inline style**
  ```bash
  grep -r "'--border-top': 'none'" packages/frontend/src --include="*.tsx" -l
  ```
  Apply same `className="... no-border"` pattern to each.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/frontend/src/app/globals.css
  git add $(git diff --name-only packages/frontend/src)
  git commit -m "fix: replace List inline border styles with CSS class"
  ```

---

## Verification

After all tasks:

- [ ] Run type check: `cd packages/frontend && npx tsc --noEmit`
- [ ] Run dev server: `npm run dev` from root
- [ ] Verify in browser:
  - [ ] Dashboard loads without white flash (z-index fix)
  - [ ] Invoice detail shows ArrowLeft icon not `←`
  - [ ] Expenses/Reports have icon buttons for month/year nav
  - [ ] Settings logout shows confirmation dialog
  - [ ] Empty states show Building2 icon not emoji
  - [ ] Reports bar chart is SVG, renders correctly
  - [ ] Bottom nav shows red badge count for pending invoices
  - [ ] Contract card shows AlertTriangle icon for expiry warning
  - [ ] No antd-mobile inline style warnings in console
- [ ] Final commit if any small fixes needed
