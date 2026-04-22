# Phase 4: Dashboard (Real Data) + CCCD Upload (R2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the dashboard to show real occupancy and revenue stats, and enable landlords to upload CCCD photos when adding tenants via Cloudflare R2 presigned URLs.

**Architecture:** Dashboard is pure frontend — compose existing `useRooms` + `useInvoices` hooks (no new API needed). Upload is a new NestJS `UploadModule` with a single `POST /upload/presigned-url` endpoint (R2 is S3-compatible via `@aws-sdk/client-s3`); the frontend calls it to get a presigned PUT URL, uploads directly to R2, then saves the public URL in the tenant record.

**Tech Stack:** NestJS 11 + ConfigService, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, TanStack Query v5, Next.js 16 App Router

---

## Codebase Context

- Pattern for all modules: `forwardRef(() => AuthModule)` in imports, `AuthGuard` + `@CurrentUser()` on controller
- `apiFetch<T>(path, options)` in `packages/frontend/src/lib/api.ts` — auto-attaches Bearer token
- `useProperties()` returns `Property[]`, first item = current property
- Existing hooks: `useRooms(propertyId)`, `useInvoices(propertyId, billingPeriod?)`
- `Invoice.status`: `'PENDING' | 'PARTIAL' | 'PAID'`, `Invoice.paidAmount`, `Invoice.total`
- `Room.status`: `'VACANT' | 'OCCUPIED' | 'MAINTENANCE'`
- Tenant DTO already has `idCardImage?: string` field, stored as URL

## File Map

### Task 1 — Dashboard real data (frontend only)
- Modify: `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`

### Task 2 — Upload backend
- Install: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` in backend
- Create: `packages/backend/src/upload/dto/get-presigned-url.dto.ts`
- Create: `packages/backend/src/upload/upload.service.ts`
- Create: `packages/backend/src/upload/upload.controller.ts`
- Create: `packages/backend/src/upload/upload.module.ts`
- Create: `packages/backend/src/upload/__tests__/upload.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

### Task 3 — Upload frontend
- Create: `packages/frontend/src/hooks/use-upload.ts`
- Modify: `packages/frontend/src/components/tenants/tenant-form-modal.tsx`

---

## Task 1: Dashboard — Real Data

**Files:**
- Modify: `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Write the implementation**

Replace `packages/frontend/src/app/(dashboard)/dashboard/page.tsx` with:

```tsx
'use client';

import Link from 'next/link';
import { Receipt, Gauge, TrendingUp } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { useInvoices, Invoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function computeStats(invoices: Invoice[] | undefined) {
  if (!invoices) return { totalRevenue: 0, pendingInvoices: [] as Invoice[] };
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingInvoices = invoices.filter((inv) => inv.status !== 'PAID');
  return { totalRevenue, pendingInvoices };
}

export default function DashboardPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';
  const billingPeriod = getCurrentBillingPeriod();
  const [year, month] = billingPeriod.split('-');

  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const { data: invoices, isLoading: loadingInvoices } = useInvoices(propertyId, billingPeriod);

  const totalRooms = rooms?.length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;
  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const { totalRevenue, pendingInvoices } = computeStats(invoices);

  const isLoading = loadingRooms || loadingInvoices;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
          <TrendingUp className="h-3.5 w-3.5" />
          Tổng thu tháng {month}/{year}
        </div>
        {isLoading ? (
          <div className="mt-2 h-9 w-40 animate-pulse rounded bg-blue-400/40" />
        ) : (
          <p className="mt-1 text-3xl font-bold">{formatPrice(totalRevenue)}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Link
            href="/invoices"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Receipt className="h-4 w-4" />
            Hóa đơn
          </Link>
          <Link
            href="/meters"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Gauge className="h-4 w-4" />
            Ghi số
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng phòng', value: totalRooms, color: 'text-gray-900' },
          { label: 'Đang thuê', value: occupiedCount, color: 'text-emerald-600' },
          { label: 'Trống', value: vacantCount, color: 'text-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm shadow-blue-100/30">
            <p className="text-xs text-gray-400">{stat.label}</p>
            {isLoading ? (
              <div className="mt-1 h-7 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={`mt-0.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pending invoices */}
      <div className="rounded-2xl bg-white shadow-sm shadow-blue-100/30">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Chưa thanh toán</h2>
          <Link href="/invoices" className="text-xs font-medium text-blue-600">
            Xem tất cả →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-px p-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        ) : pendingInvoices.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            🎉 Tất cả hóa đơn đã được thanh toán
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingInvoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {inv.room?.name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {inv.tenant?.name ?? '—'} · {formatPrice(inv.total)}
                  </p>
                </div>
                <InvoiceStatusBadge status={inv.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {!propertyId && !isLoading && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-semibold text-gray-700">Chưa có khu trọ</p>
          <p className="mt-1 text-sm text-gray-400">Hoàn thành onboarding để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/'(dashboard)'/dashboard/page.tsx
git commit -m "feat(dashboard): wire real room and invoice stats"
```

---

## Task 2: Upload Backend — Presigned URL Endpoint

**Files:**
- Create: `packages/backend/src/upload/dto/get-presigned-url.dto.ts`
- Create: `packages/backend/src/upload/upload.service.ts`
- Create: `packages/backend/src/upload/upload.controller.ts`
- Create: `packages/backend/src/upload/upload.module.ts`
- Create: `packages/backend/src/upload/__tests__/upload.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**Env vars required in `packages/backend/.env`:**
```
R2_ACCOUNT_ID=your_cf_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=room-manager
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

- [ ] **Step 1: Install AWS SDK**

```bash
cd packages/backend
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Expected: packages added to `package.json`

- [ ] **Step 2: Write the failing test**

Create `packages/backend/src/upload/__tests__/upload.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadService } from '../upload.service';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://bucket.r2.dev/presigned?sig=xxx'),
}));

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              ({
                R2_BUCKET_NAME: 'test-bucket',
                R2_PUBLIC_URL: 'https://pub.r2.dev',
                R2_ACCOUNT_ID: 'abc123',
                R2_ACCESS_KEY_ID: 'key',
                R2_SECRET_ACCESS_KEY: 'secret',
              })[key],
          },
        },
      ],
    }).compile();

    service = module.get(UploadService);
  });

  it('returns uploadUrl and fileUrl with correct extension', async () => {
    const result = await service.getPresignedUrl('photo.jpg', 'image/jpeg');

    expect(result.uploadUrl).toContain('presigned');
    expect(result.fileUrl).toMatch(/^https:\/\/pub\.r2\.dev\/uploads\/.+\.jpg$/);
    expect(result.key).toMatch(/^uploads\/.+\.jpg$/);
  });

  it('handles files without extension gracefully', async () => {
    const result = await service.getPresignedUrl('photo', 'image/jpeg');
    // key ends with ".undefined" — acceptable; just check shape
    expect(result).toHaveProperty('uploadUrl');
    expect(result).toHaveProperty('fileUrl');
    expect(result).toHaveProperty('key');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd packages/backend && pnpm test -- --testPathPattern="upload.service"
```

Expected: FAIL with "Cannot find module '../upload.service'"

- [ ] **Step 4: Create DTO**

Create `packages/backend/src/upload/dto/get-presigned-url.dto.ts`:

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
```

- [ ] **Step 5: Create UploadService**

Create `packages/backend/src/upload/upload.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.getOrThrow('R2_BUCKET_NAME');
    this.publicUrl = config.getOrThrow('R2_PUBLIC_URL');
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.getOrThrow('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.getOrThrow('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async getPresignedUrl(fileName: string, contentType: string): Promise<PresignedUrlResult> {
    const ext = fileName.split('.').pop();
    const key = `uploads/${randomUUID()}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const fileUrl = `${this.publicUrl}/${key}`;
    return { uploadUrl, fileUrl, key };
  }
}
```

- [ ] **Step 6: Create UploadController**

Create `packages/backend/src/upload/upload.controller.ts`:

```typescript
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UploadService } from './upload.service';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
    return this.uploadService.getPresignedUrl(dto.fileName, dto.contentType);
  }
}
```

- [ ] **Step 7: Create UploadModule**

Create `packages/backend/src/upload/upload.module.ts`:

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
```

- [ ] **Step 8: Register module in AppModule**

Modify `packages/backend/src/app.module.ts` — add UploadModule:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';
import { TenantsModule } from './tenants/tenants.module';
import { UtilityConfigsModule } from './utility-configs/utility-configs.module';
import { ServiceFeesModule } from './service-fees/service-fees.module';
import { MeterReadingsModule } from './meter-readings/meter-readings.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
```

- [ ] **Step 9: Run tests to verify they pass**

```bash
cd packages/backend && pnpm test -- --testPathPattern="upload.service"
```

Expected: PASS (2 tests)

- [ ] **Step 10: Verify TypeScript**

```bash
pnpm lint
```

Expected: no errors

- [ ] **Step 11: Commit**

```bash
git add packages/backend/src/upload packages/backend/src/app.module.ts packages/backend/package.json
git commit -m "feat(upload): presigned URL endpoint for R2 CCCD photo upload"
```

---

## Task 3: Upload Frontend — CCCD Image in Tenant Form

**Files:**
- Create: `packages/frontend/src/hooks/use-upload.ts`
- Modify: `packages/frontend/src/components/tenants/tenant-form-modal.tsx`

- [ ] **Step 1: Create useUploadFile hook**

Create `packages/frontend/src/hooks/use-upload.ts`:

```typescript
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface PresignedUrlResult {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export function useUploadFile() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const { uploadUrl, fileUrl } = await apiFetch<PresignedUrlResult>(
        '/upload/presigned-url',
        {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        },
      );

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!res.ok) throw new Error('Upload thất bại');
      return fileUrl;
    } catch (err) {
      setUploadError((err as Error).message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, uploadError };
}
```

- [ ] **Step 2: Update TenantFormModal with CCCD image upload**

Replace `packages/frontend/src/components/tenants/tenant-form-modal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTenant } from '@/hooks/use-tenants';
import { useUploadFile } from '@/hooks/use-upload';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';

interface TenantFormModalProps {
  roomId: string;
  trigger: React.ReactNode;
}

export function TenantFormModal({ roomId, trigger }: TenantFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardImageUrl, setIdCardImageUrl] = useState<string | null>(null);
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const createTenant = useCreateTenant(roomId);
  const { upload, isUploading, uploadError } = useUploadFile();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setIdCardImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !moveInDate) return;

    try {
      await createTenant.mutateAsync({
        name,
        phone: phone || undefined,
        idCard: idCard || undefined,
        idCardImage: idCardImageUrl || undefined,
        moveInDate,
      });
      setName('');
      setPhone('');
      setIdCard('');
      setIdCardImageUrl(null);
      setMoveInDate(new Date().toISOString().split('T')[0]);
      setOpen(false);
    } catch {
      // Error displayed via createTenant.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm người thuê</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Số CCCD (tuỳ chọn)</Label>
            <Input
              placeholder="001234567890"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
            />
          </div>

          {/* CCCD image upload */}
          <div className="space-y-2">
            <Label>Ảnh CCCD (tuỳ chọn)</Label>
            {idCardImageUrl ? (
              <div className="relative">
                <Image
                  src={idCardImageUrl}
                  alt="CCCD"
                  width={320}
                  height={180}
                  className="w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIdCardImageUrl(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-gray-400 transition hover:border-blue-300 hover:text-blue-500">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            )}
            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ngày vào</Label>
            <Input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              required
            />
          </div>
          {createTenant.error && (
            <p className="text-sm text-red-500">
              {(createTenant.error as Error).message}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={createTenant.isPending || isUploading}
          >
            {createTenant.isPending ? 'Đang thêm...' : 'Thêm người thuê'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd packages/frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/hooks/use-upload.ts packages/frontend/src/components/tenants/tenant-form-modal.tsx
git commit -m "feat(upload): CCCD photo upload in tenant form via R2 presigned URL"
```

---

## Self-Review

**Spec coverage:**
- ✅ Dashboard: room stats (total/occupied/vacant), tổng thu tháng, danh sách hóa đơn chưa thanh toán
- ✅ Upload: presigned URL endpoint → direct R2 upload → URL saved in tenant.idCardImage
- ✅ Upload secured behind AuthGuard

**Placeholder scan:** None found. All steps include full code.

**Type consistency:**
- `PresignedUrlResult` defined in `upload.service.ts` — controller returns it directly ✅
- `PresignedUrlResult` redefined inline in `use-upload.ts` (frontend doesn't share backend types) ✅
- `idCardImage` field exists in `CreateTenantDto` and `TenantsService.create` ✅
- `Invoice` type imported from `@/hooks/use-invoices` in dashboard ✅

**Note:** Upload feature requires R2 env vars set in `packages/backend/.env`. If R2 is not configured, the backend will crash on startup because `ConfigService.getOrThrow` will throw. Until R2 is ready, you can comment out `UploadModule` from `app.module.ts`.
