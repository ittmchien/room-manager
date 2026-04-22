# Phase 5: TopBar Real Property Name + PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show real property name in the mobile TopBar and make the app installable as a PWA on Android/iOS.

**Architecture:** Dashboard layout becomes a `'use client'` component that reads `useProperties()` and passes the first property's name down to `TopBar`. PWA setup adds `public/manifest.json`, generates 192×512 PNG icons via a one-shot `sharp` script, then wires the Next.js 16 metadata API (`manifest`, `appleWebApp`, `themeColor`) in root layout.

**Tech Stack:** Next.js 16 App Router, TanStack Query v5, `sharp` (devDependency for icon generation), Tailwind CSS v4

---

### Task 1: TopBar — Show Real Property Name

**Files:**
- Modify: `packages/frontend/src/app/(dashboard)/layout.tsx`

**Context:**
- `useProperties()` is in `packages/frontend/src/hooks/use-properties.ts` — returns `Property[]` with `id`, `name`, `address`
- `TopBar` is already `'use client'` and accepts `propertyName: string` prop
- When `useProperties` is loading, show a skeleton/placeholder string instead of stale "Trọ Hoa Sen"
- The dashboard layout is currently a plain server component — adding `useProperties` requires `'use client'`

- [ ] **Step 1: Rewrite dashboard layout as client component**

Replace entire `packages/frontend/src/app/(dashboard)/layout.tsx` with:

```tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TopBar } from '@/components/layout/top-bar';
import { useProperties } from '@/hooks/use-properties';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: properties, isLoading } = useProperties();
  const propertyName = isLoading
    ? '...'
    : (properties?.[0]?.name ?? 'Room Manager');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar propertyName={propertyName} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/\(dashboard\)/layout.tsx
git commit -m "feat: show real property name in TopBar from useProperties"
```

---

### Task 2: PWA — Manifest, Icons, and Meta Tags

**Files:**
- Create: `packages/frontend/public/manifest.json`
- Create: `packages/frontend/scripts/generate-icons.mjs`
- Create: `packages/frontend/public/icons/icon-192.png` (generated)
- Create: `packages/frontend/public/icons/icon-512.png` (generated)
- Create: `packages/frontend/public/icons/apple-touch-icon.png` (generated, 180×180)
- Modify: `packages/frontend/src/app/layout.tsx`
- Modify: `packages/frontend/next.config.ts`

**Context:**
- Next.js 16 uses `export const metadata` with `manifest`, `appleWebApp`, `icons` fields — NOT `<link>` tags in `<head>`
- `themeColor` is now in `export const viewport` (separate export from `metadata` in Next.js 14+)
- `sharp` is the standard Node tool for image conversion — add as devDependency in `packages/frontend`
- SVG → PNG: provide a blue square with "🏠" text as base SVG, convert via sharp
- `public/` in Next.js is served at `/` — `manifest.json` at `/manifest.json`, icons at `/icons/icon-192.png`

- [ ] **Step 1: Install sharp as devDependency**

```bash
cd packages/frontend && pnpm add -D sharp
```

Expected: `sharp` added to `packages/frontend/package.json` devDependencies

- [ ] **Step 2: Create icon generation script**

Create `packages/frontend/scripts/generate-icons.mjs`:

```js
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

// Blue square with house emoji rendered as text
// We create a simple SVG and rasterize it
function makeSvg(size) {
  const fontSize = Math.round(size * 0.5);
  return Buffer.from(`
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#2563EB"/>
  <text
    x="50%" y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-size="${fontSize}"
  >🏠</text>
</svg>`);
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(makeSvg(size), { density: 300 })
    .png()
    .toFile(join(outDir, name));
  console.log(`Generated ${name}`);
}
```

- [ ] **Step 3: Run the script to generate icons**

```bash
cd packages/frontend && node scripts/generate-icons.mjs
```

Expected output:
```
Generated icon-192.png
Generated icon-512.png
Generated apple-touch-icon.png
```

Verify files exist:
```bash
ls -lh packages/frontend/public/icons/
```

Expected: three PNG files (icon-192.png ~5–20 KB, icon-512.png ~20–80 KB, apple-touch-icon.png ~5–20 KB)

- [ ] **Step 4: Create manifest.json**

Create `packages/frontend/public/manifest.json`:

```json
{
  "name": "Room Manager",
  "short_name": "Room Mgr",
  "description": "Quản lý phòng trọ dễ dàng",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#F0F4FF",
  "theme_color": "#2563EB",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 5: Update root layout with PWA metadata**

Replace `packages/frontend/src/app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Room Manager',
  description: 'Quản lý phòng trọ dễ dàng',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Room Manager',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F0F4FF] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd packages/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7: Start dev server and check manifest is served**

```bash
curl -s http://localhost:3000/manifest.json | head -5
```

Expected: JSON with `"name": "Room Manager"`

Also check icons load:

```bash
curl -sI http://localhost:3000/icons/icon-192.png | grep -i content-type
```

Expected: `content-type: image/png`

- [ ] **Step 8: Commit**

```bash
git add packages/frontend/public/ packages/frontend/scripts/ packages/frontend/src/app/layout.tsx packages/frontend/package.json pnpm-lock.yaml
git commit -m "feat: add PWA manifest, icons, and meta tags for mobile install"
```

---

## Self-Review

**Spec coverage:**
- ✅ TopBar shows real property name via `useProperties()`
- ✅ Loading state handled (shows `'...'` during fetch)
- ✅ Fallback when no properties (`'Room Manager'`)
- ✅ `manifest.json` served at `/manifest.json`
- ✅ 192×192 and 512×512 PNG icons
- ✅ Apple touch icon (180×180)
- ✅ `theme_color` in manifest AND viewport meta
- ✅ `display: standalone` for native app feel
- ✅ `start_url: /dashboard` — opens to main screen
- ✅ `appleWebApp` metadata for iOS add-to-homescreen

**Placeholder scan:** None found — all steps have exact code.

**Type consistency:**
- `Viewport` imported from `'next'` alongside `Metadata` — correct for Next.js 14+
- `useProperties()` returns `Property[]` with `.name: string` — accessed as `properties?.[0]?.name` — correct
