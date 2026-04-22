# Phase 6: Billing Automation + Push Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-generate invoices monthly, detect overdue invoices daily, and push PWA notifications to landlords when tenants are late paying.

**Architecture:** `@nestjs/schedule` cron jobs in a new `BillingModule` handle auto-generation (1st of month) and overdue detection (daily). Web Push uses VAPID keys + `web-push` npm package. A new `PushSubscription` Prisma model stores each device's subscription. A `NotificationsModule` exposes subscribe/unsubscribe endpoints. The frontend registers a service worker (`public/sw.js`) that handles push events and shows native notifications.

**Tech Stack:** `@nestjs/schedule`, `web-push` (npm), Prisma migration, Next.js service worker, Web Push API (browser)

---

## File Map

**Backend — new:**
- `packages/backend/src/billing/billing.module.ts` — registers cron jobs
- `packages/backend/src/billing/billing.service.ts` — cron: auto-generate + overdue push
- `packages/backend/src/notifications/notifications.module.ts`
- `packages/backend/src/notifications/notifications.service.ts` — push helper
- `packages/backend/src/notifications/notifications.controller.ts` — subscribe/unsubscribe
- `packages/backend/src/notifications/dto/subscribe.dto.ts`

**Backend — modified:**
- `packages/backend/src/invoices/invoices.service.ts` — idempotency + dueDate
- `packages/backend/src/app.module.ts` — add ScheduleModule, BillingModule, NotificationsModule
- `packages/backend/package.json` — add @nestjs/schedule, web-push, @types/web-push
- `packages/backend/prisma/schema.prisma` — add PushSubscription model

**Frontend — new:**
- `packages/frontend/public/sw.js` — service worker: push event handler
- `packages/frontend/src/hooks/use-push-subscription.ts` — register SW + subscribe + POST
- `packages/frontend/src/components/dashboard/push-notification-banner.tsx`

**Frontend — modified:**
- `packages/frontend/src/app/(dashboard)/dashboard/page.tsx` — add banner
- `packages/frontend/next.config.ts` — service worker headers

---

### Task 1: Fix Invoice Generation (idempotency + dueDate)

**Files:**
- Modify: `packages/backend/src/invoices/invoices.service.ts`
- Modify: `packages/backend/src/invoices/dto/generate-invoices.dto.ts`
- Test: `packages/backend/src/invoices/__tests__/invoices.service.spec.ts`

**Context:**
- Current `generate()` calls `prisma.invoice.create` blindly — calling it twice creates duplicate invoices for the same room+period
- `dueDate` column exists on Invoice model but is never set — needed for overdue detection
- Fix: use `upsert` with `roomId + billingPeriod` as the unique key. If invoice already exists (any status), **skip** (return existing). Only create if none exists.
- `dueDate` = 15th of the billing month, e.g. billingPeriod `2026-04` → `2026-04-15T23:59:59.000Z`

**Note on schema:** Invoice has no `@@unique([roomId, billingPeriod])`. The idempotency check must be a `findFirst` + conditional `create` (not Prisma `upsert` which requires a unique constraint). Pattern: `findFirst` → if found, return existing. If not, `create`.

- [ ] **Step 1: Add @@unique constraint to Invoice in schema**

In `packages/backend/prisma/schema.prisma`, inside `model Invoice { ... }`, add before the closing `}`:

```prisma
  @@unique([roomId, billingPeriod])
  @@map("invoices")
```

Wait — check if `@@map("invoices")` already exists first. If it does, just add `@@unique([roomId, billingPeriod])` before the existing `@@map` line.

Read the full Invoice model block first, then edit to add:
```prisma
  @@unique([roomId, billingPeriod])
```
before the closing `}` (or before `@@map` if present).

- [ ] **Step 2: Create and run migration**

```bash
cd packages/backend && npx prisma migrate dev --name add_invoice_unique_room_period
```

Expected: migration file created + applied to local DB.

- [ ] **Step 3: Update invoice service generate() method**

In `packages/backend/src/invoices/invoices.service.ts`, replace the `map` callback that calls `prisma.invoice.create` with this pattern:

```typescript
return Promise.all(
  occupiedRooms.map(async (room) => {
    // Idempotency: skip if invoice already exists for this room+period
    const existing = await this.prisma.invoice.findFirst({
      where: { roomId: room.id, billingPeriod: dto.billingPeriod },
    });
    if (existing) return existing;

    const activeTenantCount = room.tenants.length;
    const tenantId = room.tenants[0].id;

    const roomFee =
      room.rentCalcType === 'PER_PERSON' && room.rentPerPersonPrice
        ? room.rentPerPersonPrice * activeTenantCount
        : room.rentPrice;

    const [electricFee, waterFee] = await Promise.all([
      this.calculateUtilityFee(room.id, dto.propertyId, 'ELECTRIC', start, end),
      this.calculateUtilityFee(room.id, dto.propertyId, 'WATER', start, end),
    ]);

    const serviceFeesDetail = serviceFees.map((fee) => ({
      id: fee.id,
      name: fee.name,
      amount:
        fee.calcType === 'FIXED_PER_ROOM'
          ? fee.unitPrice
          : fee.calcType === 'PER_PERSON'
            ? fee.unitPrice * activeTenantCount
            : 0,
    }));

    const total =
      roomFee +
      electricFee +
      waterFee +
      serviceFeesDetail.reduce((sum, f) => sum + f.amount, 0);

    // dueDate = 15th of the billing month
    const [periodYear, periodMonth] = dto.billingPeriod.split('-').map(Number);
    const dueDate = new Date(periodYear, periodMonth - 1, 15, 23, 59, 59, 999);

    return this.prisma.invoice.create({
      data: {
        roomId: room.id,
        tenantId,
        billingPeriod: dto.billingPeriod,
        roomFee,
        electricFee,
        waterFee,
        serviceFeesDetail,
        discount: 0,
        total,
        paidAmount: 0,
        status: 'PENDING',
        dueDate,
      },
    });
  }),
);
```

- [ ] **Step 4: Run backend tests**

```bash
cd packages/backend && pnpm test
```

Expected: all tests pass (no regressions).

- [ ] **Step 5: Commit**

```bash
git add packages/backend/prisma/ packages/backend/src/invoices/
git commit -m "fix: invoice generation idempotency and set dueDate on create"
```

---

### Task 2: Install @nestjs/schedule and Create BillingModule Cron Jobs

**Files:**
- Create: `packages/backend/src/billing/billing.module.ts`
- Create: `packages/backend/src/billing/billing.service.ts`
- Modify: `packages/backend/src/app.module.ts`
- Modify: `packages/backend/package.json`

**Context:**
- `@nestjs/schedule` wraps node-cron. Add `ScheduleModule.forRoot()` to AppModule once, then use `@Cron()` decorator in any service.
- Two cron jobs:
  1. **Monthly auto-generate**: `0 8 1 * *` (8am on 1st of every month). For each active property, call the same `generate()` logic for the previous month's billing period.
  2. **Daily overdue check**: `0 9 * * *` (9am every day). Find all PENDING invoices where `dueDate < now()` AND `paidAmount < total`. For each, push a notification to the property owner.
- For Task 2, the overdue cron just **logs** — the actual push send comes in Task 4 after `NotificationsModule` is ready.
- `InvoicesService` will be injected into `BillingService` — need `InvoicesModule` to export `InvoicesService`.

- [ ] **Step 1: Install @nestjs/schedule**

```bash
cd packages/backend && pnpm add @nestjs/schedule
```

- [ ] **Step 2: Ensure InvoicesModule exports InvoicesService**

Read `packages/backend/src/invoices/invoices.module.ts`. If `InvoicesService` is not in `exports`, add it:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],   // ← add this
})
export class InvoicesModule {}
```

- [ ] **Step 3: Create billing.service.ts**

Create `packages/backend/src/billing/billing.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  /** 1st of each month at 08:00 — auto-generate invoices for the CURRENT month */
  @Cron('0 8 1 * *')
  async autoGenerateInvoices() {
    this.logger.log('Running monthly invoice auto-generation...');

    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const properties = await this.prisma.property.findMany({
      select: { id: true, ownerId: true },
    });

    for (const property of properties) {
      try {
        await this.invoicesService.generate(property.ownerId, {
          propertyId: property.id,
          billingPeriod,
        });
        this.logger.log(`Generated invoices for property ${property.id} period ${billingPeriod}`);
      } catch (err) {
        this.logger.error(`Failed to generate for property ${property.id}: ${(err as Error).message}`);
      }
    }
  }

  /** Daily at 09:00 — find overdue invoices and log them (push sent by NotificationsService in Task 4) */
  @Cron('0 9 * * *')
  async checkOverdueInvoices() {
    this.logger.log('Checking overdue invoices...');

    const overdue = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      include: {
        room: { include: { property: { select: { ownerId: true } } } },
        tenant: { select: { name: true } },
      },
    });

    this.logger.log(`Found ${overdue.length} overdue invoices`);
    // Push notification will be triggered here in Task 4
  }

  /** Expose for programmatic use (e.g. from NotificationsModule in Task 4) */
  async getOverdueInvoices() {
    return this.prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      include: {
        room: { include: { property: { select: { id: true, ownerId: true } } } },
        tenant: { select: { name: true } },
      },
    });
  }
}
```

- [ ] **Step 4: Create billing.module.ts**

Create `packages/backend/src/billing/billing.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [PrismaModule, InvoicesModule],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
```

- [ ] **Step 5: Register ScheduleModule and BillingModule in AppModule**

In `packages/backend/src/app.module.ts`, add:

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { BillingModule } from './billing/billing.module';
```

And in the `imports` array add:
- `ScheduleModule.forRoot()` (before other modules)
- `BillingModule`

Final AppModule imports array:
```typescript
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  ScheduleModule.forRoot(),
  PrismaModule,
  AuthModule,
  UsersModule,
  PropertiesModule,
  RoomsModule,
  TenantsModule,
  UtilityConfigsModule,
  ServiceFeesModule,
  MeterReadingsModule,
  InvoicesModule,
  PaymentsModule,
  UploadModule,
  BillingModule,
],
```

- [ ] **Step 6: TypeScript check + tests**

```bash
cd packages/backend && npx tsc --noEmit && pnpm test
```

Expected: no errors, all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/backend/src/billing/ packages/backend/src/app.module.ts packages/backend/src/invoices/invoices.module.ts packages/backend/package.json pnpm-lock.yaml
git commit -m "feat: add @nestjs/schedule with monthly auto-generate and daily overdue cron"
```

---

### Task 3: Web Push Backend (VAPID + PushSubscription Model + NotificationsModule)

**Files:**
- Modify: `packages/backend/prisma/schema.prisma` — add PushSubscription model
- Create: `packages/backend/src/notifications/notifications.module.ts`
- Create: `packages/backend/src/notifications/notifications.service.ts`
- Create: `packages/backend/src/notifications/notifications.controller.ts`
- Create: `packages/backend/src/notifications/dto/subscribe.dto.ts`
- Modify: `packages/backend/src/billing/billing.service.ts` — inject NotificationsService, send push on overdue
- Modify: `packages/backend/src/billing/billing.module.ts` — import NotificationsModule
- Modify: `packages/backend/src/app.module.ts` — add NotificationsModule

**Context:**
- `web-push` npm package handles VAPID signing and sending Web Push messages
- VAPID key pair is generated once, stored in env vars `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` is a `mailto:` or `https:` URL identifying the push sender
- PushSubscription stores: endpoint, p256dhKey, authKey, userId
- One user can have multiple subscriptions (multiple devices)
- Subscribe endpoint: `POST /notifications/subscribe` (auth required)
- Unsubscribe endpoint: `DELETE /notifications/subscribe` (auth required)
- Push send: called from BillingService overdue cron

**Generate VAPID keys** (run once, save to .env):
```bash
node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
```

- [ ] **Step 1: Install web-push**

```bash
cd packages/backend && pnpm add web-push && pnpm add -D @types/web-push
```

- [ ] **Step 2: Generate VAPID keys and add to .env**

```bash
cd packages/backend && node -e "const webpush = require('web-push'); const keys = webpush.generateVAPIDKeys(); console.log('VAPID_PUBLIC_KEY=' + keys.publicKey); console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);"
```

Append output to `packages/backend/.env`:
```
VAPID_PUBLIC_KEY=<generated_public_key>
VAPID_PRIVATE_KEY=<generated_private_key>
VAPID_SUBJECT=mailto:admin@roommanager.vn
```

Also add to `packages/frontend/.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<same_generated_public_key>
```

- [ ] **Step 3: Add PushSubscription model to Prisma schema**

In `packages/backend/prisma/schema.prisma`, after the `User` model (or at end of file before enums), add:

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  endpoint  String   @unique
  p256dhKey String   @map("p256dh_key")
  authKey   String   @map("auth_key")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_subscriptions")
}
```

Also add the relation back on User model — read the User model and add:
```prisma
  pushSubscriptions PushSubscription[]
```

- [ ] **Step 4: Create and run migration**

```bash
cd packages/backend && npx prisma migrate dev --name add_push_subscriptions
```

Expected: migration applied.

- [ ] **Step 5: Create subscribe DTO**

Create `packages/backend/src/notifications/dto/subscribe.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class SubscribeDto {
  @IsUrl()
  endpoint!: string;

  @IsString()
  @IsNotEmpty()
  p256dhKey!: string;

  @IsString()
  @IsNotEmpty()
  authKey!: string;
}
```

- [ ] **Step 6: Create NotificationsService**

Create `packages/backend/src/notifications/notifications.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    webpush.setVapidDetails(
      this.config.get<string>('VAPID_SUBJECT')!,
      this.config.get<string>('VAPID_PUBLIC_KEY')!,
      this.config.get<string>('VAPID_PRIVATE_KEY')!,
    );
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: { p256dhKey: dto.p256dhKey, authKey: dto.authKey, userId },
      create: { userId, endpoint: dto.endpoint, p256dhKey: dto.p256dhKey, authKey: dto.authKey },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
            JSON.stringify(payload),
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            // Subscription expired — delete it
            await this.prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
            this.logger.warn(`Deleted expired subscription for user ${userId}`);
          } else {
            this.logger.error(`Push send failed for user ${userId}: ${(err as Error).message}`);
          }
        }
      }),
    );
  }
}
```

- [ ] **Step 7: Create NotificationsController**

Create `packages/backend/src/notifications/notifications.controller.ts`:

```typescript
import { Controller, Post, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('subscribe')
  subscribe(@CurrentUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.notificationsService.subscribe(userId, dto);
  }

  @Delete('subscribe')
  unsubscribe(@CurrentUser('id') userId: string, @Query('endpoint') endpoint: string) {
    return this.notificationsService.unsubscribe(userId, endpoint);
  }
}
```

**Note:** Check how `CurrentUser` decorator is defined in this codebase. Read `packages/backend/src/auth/current-user.decorator.ts` first. If it doesn't exist, look at how other controllers access the current user and match the pattern.

- [ ] **Step 8: Create NotificationsModule**

Create `packages/backend/src/notifications/notifications.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

- [ ] **Step 9: Wire NotificationsService into BillingService overdue cron**

In `packages/backend/src/billing/billing.service.ts`:

1. Add import: `import { NotificationsService } from '../notifications/notifications.service';`
2. Inject in constructor: `private notificationsService: NotificationsService`
3. Update `checkOverdueInvoices()` to send pushes after finding overdue invoices:

```typescript
@Cron('0 9 * * *')
async checkOverdueInvoices() {
  this.logger.log('Checking overdue invoices...');

  const overdue = await this.getOverdueInvoices();
  this.logger.log(`Found ${overdue.length} overdue invoices`);

  // Group by owner
  const byOwner = new Map<string, typeof overdue>();
  for (const inv of overdue) {
    const ownerId = inv.room.property.ownerId;
    if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
    byOwner.get(ownerId)!.push(inv);
  }

  for (const [ownerId, invoices] of byOwner) {
    const count = invoices.length;
    await this.notificationsService.sendToUser(ownerId, {
      title: 'Nhắc thanh toán',
      body: `Có ${count} hóa đơn chưa thanh toán`,
      url: '/invoices',
    });
  }
}
```

- [ ] **Step 10: Update BillingModule to import NotificationsModule**

In `packages/backend/src/billing/billing.module.ts`, add `NotificationsModule` to imports:

```typescript
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, InvoicesModule, NotificationsModule],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
```

- [ ] **Step 11: Add NotificationsModule to AppModule**

In `packages/backend/src/app.module.ts`:

```typescript
import { NotificationsModule } from './notifications/notifications.module';
```

Add `NotificationsModule` to imports array.

- [ ] **Step 12: TypeScript check + tests**

```bash
cd packages/backend && npx tsc --noEmit && pnpm test
```

Expected: no errors, all tests pass.

- [ ] **Step 13: Commit**

```bash
git add packages/backend/src/notifications/ packages/backend/src/billing/ packages/backend/src/app.module.ts packages/backend/prisma/ packages/backend/.env packages/backend/package.json pnpm-lock.yaml
git commit -m "feat: web push notifications with VAPID, PushSubscription model, overdue cron push"
```

---

### Task 4: Frontend Service Worker + Push Subscription

**Files:**
- Create: `packages/frontend/public/sw.js`
- Create: `packages/frontend/src/hooks/use-push-subscription.ts`
- Create: `packages/frontend/src/components/dashboard/push-notification-banner.tsx`
- Modify: `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`
- Modify: `packages/frontend/next.config.ts`

**Context:**
- Service worker file at `public/sw.js` is served at `/sw.js` by Next.js
- The SW handles `push` events: parse payload JSON, call `self.registration.showNotification()`
- The SW handles `notificationclick` events: focus/open the app at `payload.url`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` env var is used client-side for the subscribe call
- `navigator.serviceWorker.register('/sw.js')` + `PushManager.subscribe()` = get `PushSubscription` object
- POST the subscription's endpoint, p256dh, and auth to backend `/notifications/subscribe`
- Only show the "Enable notifications" banner if permission is `'default'` (not yet asked)
- If permission is `'denied'`, don't show the banner (can't request again)

- [ ] **Step 1: Create service worker**

Create `packages/frontend/public/sw.js`:

```javascript
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Room Manager', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Room Manager', {
      body: payload.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url ?? '/dashboard' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
```

- [ ] **Step 2: Add service worker headers in next.config.ts**

Read `packages/frontend/next.config.ts`, then add `headers` config so the SW can control the full app scope:

```typescript
async headers() {
  return [
    {
      source: '/sw.js',
      headers: [
        { key: 'Service-Worker-Allowed', value: '/' },
        { key: 'Cache-Control', value: 'no-cache' },
      ],
    },
  ];
},
```

- [ ] **Step 3: Create usePushSubscription hook**

Create `packages/frontend/src/hooks/use-push-subscription.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushSubscription() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dhKey: json.keys?.p256dh,
          authKey: json.keys?.auth,
        }),
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error('Push subscription failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { permission, isSubscribed, isLoading, subscribe };
}
```

- [ ] **Step 4: Create PushNotificationBanner component**

Create `packages/frontend/src/components/dashboard/push-notification-banner.tsx`:

```tsx
'use client';

import { Bell } from 'lucide-react';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushNotificationBanner() {
  const { permission, isSubscribed, isLoading, subscribe } = usePushSubscription();

  // Don't show if: already granted+subscribed, denied, or not supported
  if (isSubscribed || permission === 'denied' || permission === 'granted') return null;
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Bell className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-medium text-blue-800">
          Bật thông báo để nhắc tiền thuê
        </p>
      </div>
      <button
        onClick={subscribe}
        disabled={isLoading}
        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? 'Đang bật...' : 'Bật'}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Add banner to dashboard page**

Read `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`. Import and add `<PushNotificationBanner />` at the top of the returned JSX (before the hero card):

```tsx
import { PushNotificationBanner } from '@/components/dashboard/push-notification-banner';

// Inside return, first child in <div className="space-y-4">:
<PushNotificationBanner />
```

- [ ] **Step 6: TypeScript check**

```bash
cd packages/frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Verify SW is served correctly** (requires dev server running)

```bash
curl -s -I http://localhost:3000/sw.js | grep -i "service-worker\|content-type"
```

Expected: `Service-Worker-Allowed: /` header present, `Content-Type: application/javascript` or similar.

- [ ] **Step 8: Commit**

```bash
git add packages/frontend/public/sw.js packages/frontend/src/hooks/use-push-subscription.ts packages/frontend/src/components/dashboard/ packages/frontend/src/app/\(dashboard\)/dashboard/page.tsx packages/frontend/next.config.ts packages/frontend/.env.local
git commit -m "feat: service worker push handler and subscription UI on dashboard"
```

---

## Self-Review

**Spec coverage:**
- ✅ Invoice generation idempotency — `findFirst` guard + skip if exists
- ✅ `dueDate` set on creation (15th of billing month)
- ✅ Monthly cron auto-generate invoices (1st of month 8am)
- ✅ Daily cron overdue check (9am) + push to property owner
- ✅ VAPID keys + `web-push` package
- ✅ `PushSubscription` model with cascade delete
- ✅ Subscribe/unsubscribe endpoints (auth-guarded)
- ✅ Expired subscription cleanup (410/404 handling)
- ✅ Service worker push + notificationclick handlers
- ✅ Push permission banner on dashboard (only when `'default'`)
- ✅ Notification groups by owner (one push per owner, not per invoice)

**Placeholder scan:** None found.

**Type consistency:**
- `NotificationsService.sendToUser(userId, { title, body, url })` — used in `BillingService.checkOverdueInvoices()` with matching shape
- `SubscribeDto` fields `endpoint`, `p256dhKey`, `authKey` match what frontend POSTs from `sub.toJSON()`
- `CurrentUser('id')` decorator — implementation must match existing auth pattern in this codebase (Step 7 note: verify before implementing)
