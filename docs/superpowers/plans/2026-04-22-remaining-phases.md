# Room Manager — Remaining Phases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all remaining features: Contracts, Expenses, Reports (BE+FE), Feature Gating via API, Push Notification subscription flow (FE), and Ad banners (FE).

**Architecture:** NestJS modules follow the existing pattern (controller → service → prisma). FE follows React Query hooks + antd-mobile components. Prisma schema already has all models defined — no migrations needed unless noted. Feature gating replaces the env-var `isPremiumEnabled` with a real API call to `/me/features`.

**Tech Stack:** NestJS 11, Prisma, PostgreSQL (Supabase), Next.js 16, antd-mobile 5, React Query, TypeScript, Tailwind CSS, web-push (already installed)

---

## File Map

### Backend (new files)
- `packages/backend/src/contracts/contracts.module.ts`
- `packages/backend/src/contracts/contracts.controller.ts`
- `packages/backend/src/contracts/contracts.service.ts`
- `packages/backend/src/contracts/dto/create-contract.dto.ts`
- `packages/backend/src/contracts/dto/update-contract.dto.ts`
- `packages/backend/src/expenses/expenses.module.ts`
- `packages/backend/src/expenses/expenses.controller.ts`
- `packages/backend/src/expenses/expenses.service.ts`
- `packages/backend/src/expenses/dto/create-expense.dto.ts`
- `packages/backend/src/reports/reports.module.ts`
- `packages/backend/src/reports/reports.controller.ts`
- `packages/backend/src/reports/reports.service.ts`
- `packages/backend/src/user-features/user-features.module.ts`
- `packages/backend/src/user-features/user-features.controller.ts`
- `packages/backend/src/user-features/user-features.service.ts`

### Backend (modify)
- `packages/backend/src/app.module.ts` — add ContractsModule, ExpensesModule, ReportsModule, UserFeaturesModule
- `packages/backend/src/billing/billing.service.ts` — add contract expiry cron

### Frontend (new files)
- `packages/frontend/src/hooks/use-contracts.ts`
- `packages/frontend/src/hooks/use-expenses.ts`
- `packages/frontend/src/hooks/use-reports.ts`
- `packages/frontend/src/hooks/use-features.ts`
- `packages/frontend/src/components/contracts/contract-card.tsx`
- `packages/frontend/src/components/contracts/contract-form-modal.tsx`
- `packages/frontend/src/components/expenses/expense-form-modal.tsx`
- `packages/frontend/src/components/ads/ad-banner.tsx`
- `packages/frontend/src/app/(dashboard)/contracts/page.tsx`
- `packages/frontend/src/app/(dashboard)/expenses/page.tsx`
- `packages/frontend/src/app/(dashboard)/reports/page.tsx`

### Frontend (modify)
- `packages/frontend/src/lib/features.ts` — add `useUserFeatures()` hook wrapper
- `packages/frontend/src/components/layout/sidebar.tsx` — use API feature check
- `packages/frontend/src/components/layout/bottom-nav.tsx` — use API feature check
- `packages/frontend/src/components/dashboard/push-notification-banner.tsx` — wire real subscribe
- `packages/frontend/src/app/(dashboard)/dashboard/page.tsx` — add AdBanner

---

## Task 1: Contracts BE — CRUD API

**Files:**
- Create: `packages/backend/src/contracts/dto/create-contract.dto.ts`
- Create: `packages/backend/src/contracts/dto/update-contract.dto.ts`
- Create: `packages/backend/src/contracts/contracts.service.ts`
- Create: `packages/backend/src/contracts/contracts.controller.ts`
- Create: `packages/backend/src/contracts/contracts.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

`packages/backend/src/contracts/dto/create-contract.dto.ts`:
```typescript
export class CreateContractDto {
  roomId: string;
  tenantId: string;
  startDate: string; // ISO date string
  endDate?: string;
  depositAmount?: number;
  depositStatus?: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms?: string;
}
```

`packages/backend/src/contracts/dto/update-contract.dto.ts`:
```typescript
export class UpdateContractDto {
  endDate?: string;
  depositAmount?: number;
  depositStatus?: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms?: string;
}
```

- [ ] **Step 2: Create ContractsService**

`packages/backend/src/contracts/contracts.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateContractDto) {
    // Verify room belongs to user
    const room = await this.prisma.room.findFirst({
      where: { id: dto.roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');

    return this.prisma.contract.create({
      data: {
        roomId: dto.roomId,
        tenantId: dto.tenantId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        depositAmount: dto.depositAmount ?? 0,
        depositStatus: dto.depositStatus ?? 'PENDING',
        terms: dto.terms,
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.contract.findMany({
      where: { room: { propertyId } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
    if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng');
    return contract;
  }

  async update(userId: string, id: string, dto: UpdateContractDto) {
    await this.findOne(userId, id);
    return this.prisma.contract.update({
      where: { id },
      data: {
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        depositAmount: dto.depositAmount,
        depositStatus: dto.depositStatus,
        terms: dto.terms,
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.contract.delete({ where: { id } });
  }

  async getExpiringContracts(daysAhead: number) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + daysAhead);

    return this.prisma.contract.findMany({
      where: {
        endDate: { gte: from, lte: to },
      },
      include: {
        room: { include: { property: { select: { id: true, ownerId: true, name: true } } } },
        tenant: { select: { name: true } },
      },
    });
  }
}
```

- [ ] **Step 3: Create ContractsController**

`packages/backend/src/contracts/contracts.controller.ts`:
```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('properties/:propertyId/contracts')
@UseGuards(AuthGuard)
export class ContractsByPropertyController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.contractsService.findAllByProperty(user.id, propertyId);
  }
}

@Controller('contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.contractsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contractsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contractsService.remove(user.id, id);
  }
}
```

- [ ] **Step 4: Create ContractsModule**

`packages/backend/src/contracts/contracts.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ContractsService } from './contracts.service';
import { ContractsController, ContractsByPropertyController } from './contracts.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContractsByPropertyController, ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
```

- [ ] **Step 5: Register in AppModule**

In `packages/backend/src/app.module.ts`, add:
```typescript
import { ContractsModule } from './contracts/contracts.module';
// Add ContractsModule to the imports array
```

- [ ] **Step 6: Verify BE compiles**

```bash
cd packages/backend && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add packages/backend/src/contracts/ packages/backend/src/app.module.ts
git commit -m "feat: add contracts CRUD API"
```

---

## Task 2: Expenses BE — CRUD API

**Files:**
- Create: `packages/backend/src/expenses/dto/create-expense.dto.ts`
- Create: `packages/backend/src/expenses/expenses.service.ts`
- Create: `packages/backend/src/expenses/expenses.controller.ts`
- Create: `packages/backend/src/expenses/expenses.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTO**

`packages/backend/src/expenses/dto/create-expense.dto.ts`:
```typescript
export class CreateExpenseDto {
  propertyId: string;
  roomId?: string;
  category: string; // e.g. 'repair', 'maintenance', 'other'
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string; // ISO date string
  note?: string;
}
```

- [ ] **Step 2: Create ExpensesService**

`packages/backend/src/expenses/expenses.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.expense.create({
      data: {
        propertyId: dto.propertyId,
        roomId: dto.roomId ?? null,
        category: dto.category,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        note: dto.note,
      },
      include: {
        room: { select: { id: true, name: true } },
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string, month?: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const where: Record<string, unknown> = { propertyId };
    if (month) {
      // month format: YYYY-MM
      const [year, mon] = month.split('-').map(Number);
      const from = new Date(year, mon - 1, 1);
      const to = new Date(year, mon, 1);
      where.date = { gte: from, lt: to };
    }

    return this.prisma.expense.findMany({
      where,
      include: { room: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, property: { ownerId: userId } },
    });
    if (!expense) throw new NotFoundException('Không tìm thấy khoản thu/chi');
    return this.prisma.expense.delete({ where: { id } });
  }
}
```

- [ ] **Step 3: Create ExpensesController**

`packages/backend/src/expenses/expenses.controller.ts`:
```typescript
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('properties/:propertyId/expenses')
@UseGuards(AuthGuard)
export class ExpensesByPropertyController {
  constructor(private expensesService: ExpensesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Query('month') month?: string,
  ) {
    return this.expensesService.findAllByProperty(user.id, propertyId, month);
  }
}

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.expensesService.remove(user.id, id);
  }
}
```

- [ ] **Step 4: Create ExpensesModule**

`packages/backend/src/expenses/expenses.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController, ExpensesByPropertyController } from './expenses.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExpensesByPropertyController, ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
```

- [ ] **Step 5: Register in AppModule**

In `packages/backend/src/app.module.ts`, import and add `ExpensesModule`.

- [ ] **Step 6: Compile check**

```bash
cd packages/backend && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add packages/backend/src/expenses/ packages/backend/src/app.module.ts
git commit -m "feat: add expenses CRUD API"
```

---

## Task 3: Reports BE — Aggregate endpoint

**Files:**
- Create: `packages/backend/src/reports/reports.service.ts`
- Create: `packages/backend/src/reports/reports.controller.ts`
- Create: `packages/backend/src/reports/reports.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create ReportsService**

`packages/backend/src/reports/reports.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlySummary(userId: string, propertyId: string, year: number) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const results = await Promise.all(
      months.map(async (month) => {
        const billingPeriod = `${year}-${String(month).padStart(2, '0')}`;
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 1);

        const [invoices, expenses] = await Promise.all([
          this.prisma.invoice.findMany({
            where: { room: { propertyId }, billingPeriod },
            select: { total: true, paidAmount: true, status: true },
          }),
          this.prisma.expense.findMany({
            where: { propertyId, date: { gte: from, lt: to } },
            select: { amount: true, type: true },
          }),
        ]);

        const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
        const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
        const totalExpenses = expenses
          .filter((e) => e.type === 'EXPENSE')
          .reduce((s, e) => s + e.amount, 0);
        const totalOtherIncome = expenses
          .filter((e) => e.type === 'INCOME')
          .reduce((s, e) => s + e.amount, 0);

        return {
          month: billingPeriod,
          totalBilled,
          totalCollected,
          totalExpenses,
          totalOtherIncome,
          profit: totalCollected + totalOtherIncome - totalExpenses,
          invoiceCount: invoices.length,
          paidCount: invoices.filter((i) => i.status === 'PAID').length,
        };
      }),
    );

    return results;
  }

  async getPropertySnapshot(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [rooms, currentInvoices] = await Promise.all([
      this.prisma.room.findMany({
        where: { propertyId },
        select: { status: true },
      }),
      this.prisma.invoice.findMany({
        where: { room: { propertyId }, billingPeriod: currentPeriod },
        select: { total: true, paidAmount: true, status: true },
      }),
    ]);

    return {
      totalRooms: rooms.length,
      occupiedRooms: rooms.filter((r) => r.status === 'OCCUPIED').length,
      vacantRooms: rooms.filter((r) => r.status === 'VACANT').length,
      currentPeriod,
      totalBilledThisMonth: currentInvoices.reduce((s, i) => s + i.total, 0),
      totalCollectedThisMonth: currentInvoices.reduce((s, i) => s + i.paidAmount, 0),
      pendingCount: currentInvoices.filter((i) => i.status !== 'PAID').length,
    };
  }
}
```

- [ ] **Step 2: Create ReportsController**

`packages/backend/src/reports/reports.controller.ts`:
```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ReportsService } from './reports.service';

@Controller('properties/:propertyId/reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlySummary(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Query('year') year?: string,
  ) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.reportsService.getMonthlySummary(user.id, propertyId, y);
  }

  @Get('snapshot')
  getSnapshot(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.reportsService.getPropertySnapshot(user.id, propertyId);
  }
}
```

- [ ] **Step 3: Create ReportsModule**

`packages/backend/src/reports/reports.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
```

- [ ] **Step 4: Register in AppModule**

Import and add `ReportsModule` to `app.module.ts`.

- [ ] **Step 5: Compile check and commit**

```bash
cd packages/backend && npx tsc --noEmit
git add packages/backend/src/reports/ packages/backend/src/app.module.ts
git commit -m "feat: add reports aggregate API"
```

---

## Task 4: UserFeatures BE — GET /me/features

**Files:**
- Create: `packages/backend/src/user-features/user-features.service.ts`
- Create: `packages/backend/src/user-features/user-features.controller.ts`
- Create: `packages/backend/src/user-features/user-features.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create UserFeaturesService**

`packages/backend/src/user-features/user-features.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserFeaturesService {
  constructor(private prisma: PrismaService) {}

  async getActiveFeatures(userId: string): Promise<string[]> {
    const features = await this.prisma.userFeature.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { featureKey: true },
    });
    return features.map((f) => f.featureKey);
  }
}
```

- [ ] **Step 2: Create UserFeaturesController**

`packages/backend/src/user-features/user-features.controller.ts`:
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { UserFeaturesService } from './user-features.service';

@Controller('me/features')
@UseGuards(AuthGuard)
export class UserFeaturesController {
  constructor(private userFeaturesService: UserFeaturesService) {}

  @Get()
  getFeatures(@CurrentUser() user: AuthUser) {
    return this.userFeaturesService.getActiveFeatures(user.id);
  }
}
```

- [ ] **Step 3: Create UserFeaturesModule**

`packages/backend/src/user-features/user-features.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserFeaturesService } from './user-features.service';
import { UserFeaturesController } from './user-features.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserFeaturesController],
  providers: [UserFeaturesService],
  exports: [UserFeaturesService],
})
export class UserFeaturesModule {}
```

- [ ] **Step 4: Register in AppModule**

Import and add `UserFeaturesModule` to `app.module.ts`.

- [ ] **Step 5: Compile check and commit**

```bash
cd packages/backend && npx tsc --noEmit
git add packages/backend/src/user-features/ packages/backend/src/app.module.ts
git commit -m "feat: add user features API endpoint"
```

---

## Task 5: Contract Expiry Cron — BE

**Files:**
- Modify: `packages/backend/src/billing/billing.service.ts`

- [ ] **Step 1: Add contract expiry cron to BillingService**

Add import and new method to `packages/backend/src/billing/billing.service.ts`:

```typescript
// Add to existing imports
import { ContractsService } from '../contracts/contracts.service';

// Update constructor
constructor(
  private prisma: PrismaService,
  private invoicesService: InvoicesService,
  private notificationsService: NotificationsService,
  private contractsService: ContractsService,
) {}

/** Daily at 09:30 — notify owners of contracts expiring within 30 days */
@Cron('30 9 * * *')
async checkExpiringContracts() {
  this.logger.log('Checking expiring contracts...');

  const expiring = await this.contractsService.getExpiringContracts(30);

  const byOwner = new Map<string, typeof expiring>();
  for (const contract of expiring) {
    const ownerId = contract.room.property.ownerId;
    if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
    byOwner.get(ownerId)!.push(contract);
  }

  for (const [ownerId, contracts] of byOwner) {
    await this.notificationsService.sendToUser(ownerId, {
      title: 'Hợp đồng sắp hết hạn',
      body: `Có ${contracts.length} hợp đồng sắp hết hạn trong 30 ngày tới`,
      url: '/contracts',
    });
  }
}
```

Also update BillingModule to import ContractsModule:

`packages/backend/src/billing/billing.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [InvoicesModule, NotificationsModule, ContractsModule],
  providers: [BillingService],
})
export class BillingModule {}
```

- [ ] **Step 2: Compile check and commit**

```bash
cd packages/backend && npx tsc --noEmit
git add packages/backend/src/billing/
git commit -m "feat: add contract expiry cron notification"
```

---

## Task 6: FE Hooks — Contracts, Expenses, Reports, Features

**Files:**
- Create: `packages/frontend/src/hooks/use-contracts.ts`
- Create: `packages/frontend/src/hooks/use-expenses.ts`
- Create: `packages/frontend/src/hooks/use-reports.ts`
- Create: `packages/frontend/src/hooks/use-features.ts`

- [ ] **Step 1: Create use-contracts.ts**

`packages/frontend/src/hooks/use-contracts.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string | null;
  depositAmount: number;
  depositStatus: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms: string | null;
  createdAt: string;
  room?: { id: string; name: string };
  tenant?: { id: string; name: string };
}

export interface CreateContractData {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  depositAmount?: number;
  depositStatus?: Contract['depositStatus'];
  terms?: string;
}

export function useContracts(propertyId: string) {
  return useQuery<Contract[]>({
    queryKey: ['contracts', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/contracts`),
    enabled: !!propertyId,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContractData) =>
      apiFetch('/contracts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUpdateContract(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateContractData>) =>
      apiFetch(`/contracts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/contracts/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}
```

- [ ] **Step 2: Create use-expenses.ts**

`packages/frontend/src/hooks/use-expenses.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Expense {
  id: string;
  propertyId: string;
  roomId: string | null;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note: string | null;
  room?: { id: string; name: string } | null;
}

export interface CreateExpenseData {
  propertyId: string;
  roomId?: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note?: string;
}

export function useExpenses(propertyId: string, month?: string) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', propertyId, month],
    queryFn: () =>
      apiFetch(`/properties/${propertyId}/expenses${month ? `?month=${month}` : ''}`),
    enabled: !!propertyId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) =>
      apiFetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
```

- [ ] **Step 3: Create use-reports.ts**

`packages/frontend/src/hooks/use-reports.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalBilled: number;
  totalCollected: number;
  totalExpenses: number;
  totalOtherIncome: number;
  profit: number;
  invoiceCount: number;
  paidCount: number;
}

export interface PropertySnapshot {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  currentPeriod: string;
  totalBilledThisMonth: number;
  totalCollectedThisMonth: number;
  pendingCount: number;
}

export function useMonthlyReport(propertyId: string, year: number) {
  return useQuery<MonthlyReport[]>({
    queryKey: ['reports', 'monthly', propertyId, year],
    queryFn: () => apiFetch(`/properties/${propertyId}/reports/monthly?year=${year}`),
    enabled: !!propertyId,
  });
}

export function usePropertySnapshot(propertyId: string) {
  return useQuery<PropertySnapshot>({
    queryKey: ['reports', 'snapshot', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/reports/snapshot`),
    enabled: !!propertyId,
  });
}
```

- [ ] **Step 4: Create use-features.ts**

`packages/frontend/src/hooks/use-features.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';

export function useFeatures() {
  return useQuery<string[]>({
    queryKey: ['features'],
    queryFn: () => apiFetch('/me/features'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHasFeature(featureKey: string) {
  const { data: features } = useFeatures();
  return features?.includes(featureKey) ?? false;
}

export { FEATURE_KEYS };
```

- [ ] **Step 5: Commit**

```bash
git add packages/frontend/src/hooks/use-contracts.ts packages/frontend/src/hooks/use-expenses.ts packages/frontend/src/hooks/use-reports.ts packages/frontend/src/hooks/use-features.ts
git commit -m "feat: add FE hooks for contracts, expenses, reports, features"
```

---

## Task 7: Contracts FE — Page + Components

**Files:**
- Create: `packages/frontend/src/components/contracts/contract-card.tsx`
- Create: `packages/frontend/src/components/contracts/contract-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/contracts/page.tsx`

- [ ] **Step 1: Create ContractCard**

`packages/frontend/src/components/contracts/contract-card.tsx`:
```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Tag } from 'antd-mobile';
import { Contract } from '@/hooks/use-contracts';

const DEPOSIT_STATUS_MAP: Record<Contract['depositStatus'], { label: string; color: string }> = {
  PENDING: { label: 'Chưa cọc', color: 'warning' },
  PAID: { label: 'Đã cọc', color: 'success' },
  RETURNED: { label: 'Đã trả', color: 'default' },
  DEDUCTED: { label: 'Khấu trừ', color: 'danger' },
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
  const router = useRouter();
  const deposit = DEPOSIT_STATUS_MAP[contract.depositStatus];
  const daysLeft = getDaysLeft(contract.endDate);

  return (
    <button
      onClick={() => router.push(`/contracts/${contract.id}`)}
      className="w-full rounded-2xl bg-white p-4 shadow-sm text-left active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{contract.room?.name ?? '—'}</p>
          <p className="text-sm text-gray-500 truncate">{contract.tenant?.name ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-400">
            {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <Tag color={deposit.color as 'warning' | 'success' | 'default' | 'danger'}>{deposit.label}</Tag>
          {contract.depositAmount > 0 && (
            <p className="text-xs text-gray-500">
              Cọc: {contract.depositAmount.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>
      {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          ⚠ Còn {daysLeft} ngày hết hạn
        </p>
      )}
      {daysLeft !== null && daysLeft <= 0 && (
        <p className="mt-2 text-xs font-medium text-red-500">Đã hết hạn</p>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create ContractFormModal**

`packages/frontend/src/components/contracts/contract-form-modal.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreateContract } from '@/hooks/use-contracts';
import { useRooms } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const DEPOSIT_OPTIONS = [
  { label: 'Chưa cọc', value: 'PENDING' },
  { label: 'Đã cọc', value: 'PAID' },
];

export function ContractFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStatus, setDepositStatus] = useState<string[]>(['PENDING']);
  const [terms, setTerms] = useState('');

  const { data: rooms } = useRooms(propertyId);
  const roomOptions = (rooms ?? []).map((r) => ({ label: r.name, value: r.id }));

  const selectedRoom = rooms?.find((r) => r.id === roomId);
  const tenantOptions = (selectedRoom?.tenants ?? []).map((t) => ({ label: t.name, value: t.id }));

  const createContract = useCreateContract();

  const reset = () => {
    setRoomId(''); setTenantId(''); setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(''); setDepositAmount(''); setDepositStatus(['PENDING']); setTerms('');
  };

  const handleSubmit = async () => {
    if (!roomId || !tenantId || !startDate) return;
    try {
      await createContract.mutateAsync({
        roomId,
        tenantId,
        startDate,
        endDate: endDate || undefined,
        depositAmount: depositAmount ? parseInt(depositAmount) : 0,
        depositStatus: depositStatus[0] as 'PENDING' | 'PAID',
        terms: terms || undefined,
      });
      reset();
      setOpen(false);
    } catch {}
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => { setOpen(false); reset(); }}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="max-h-[85vh] overflow-y-auto p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thêm hợp đồng</h3>
            <Button fill="none" size="small" onClick={() => { setOpen(false); reset(); }} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-gray-400">Phòng *</p>
              <Selector
                options={roomOptions}
                value={[roomId]}
                onChange={(v) => { setRoomId(v[0] ?? ''); setTenantId(''); }}
                style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties}
              />
            </div>

            {roomId && tenantOptions.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-gray-400">Người thuê *</p>
                <Selector
                  options={tenantOptions}
                  value={[tenantId]}
                  onChange={(v) => setTenantId(v[0] ?? '')}
                  style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties}
                />
              </div>
            )}

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày bắt đầu *</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày kết thúc</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tiền cọc (VNĐ)</p>
              <Input
                type="number"
                placeholder="0"
                value={depositAmount}
                onChange={setDepositAmount}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Trạng thái cọc</p>
              <Selector
                options={DEPOSIT_OPTIONS}
                value={depositStatus}
                onChange={setDepositStatus}
                style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties}
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Điều khoản (tuỳ chọn)</p>
              <Input
                placeholder="Ghi chú điều khoản..."
                value={terms}
                onChange={setTerms}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
          </div>

          {createContract.error && (
            <p className="mt-3 text-sm text-red-500">{(createContract.error as Error).message}</p>
          )}

          <Button
            block color="primary" size="large"
            className="mt-5 !rounded-xl"
            loading={createContract.isPending}
            disabled={!roomId || !tenantId || !startDate}
            onClick={handleSubmit}
          >
            Thêm hợp đồng
          </Button>
        </div>
      </Popup>
    </>
  );
}
```

- [ ] **Step 3: Create Contracts Page**

`packages/frontend/src/app/(dashboard)/contracts/page.tsx`:
```tsx
'use client';

import { Plus } from 'lucide-react';
import { Button, ErrorBlock, Skeleton } from 'antd-mobile';
import { useContracts } from '@/hooks/use-contracts';
import { useProperty } from '@/contexts/property-context';
import { ContractCard } from '@/components/contracts/contract-card';
import { ContractFormModal } from '@/components/contracts/contract-form-modal';

export default function ContractsPage() {
  const { propertyId } = useProperty();
  const { data: contracts, isLoading } = useContracts(propertyId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hợp đồng</h1>
          {contracts && (
            <p className="text-sm text-gray-400">{contracts.length} hợp đồng</p>
          )}
        </div>
        {propertyId && (
          <ContractFormModal
            propertyId={propertyId}
            trigger={
              <Button size="small" color="primary" className="!rounded-[20px]">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm
              </Button>
            }
          />
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-3/5" />
              <Skeleton.Paragraph lineCount={2} animated />
            </div>
          ))}
        </div>
      ) : !propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : contracts?.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có hợp đồng nào" />
      ) : (
        <div className="space-y-3">
          {contracts?.map((c) => <ContractCard key={c.id} contract={c} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/components/contracts/ packages/frontend/src/app/\(dashboard\)/contracts/
git commit -m "feat: add contracts FE page and components"
```

---

## Task 8: Expenses FE — Page + Form Modal

**Files:**
- Create: `packages/frontend/src/components/expenses/expense-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/expenses/page.tsx`

- [ ] **Step 1: Create ExpenseFormModal**

`packages/frontend/src/components/expenses/expense-form-modal.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreateExpense } from '@/hooks/use-expenses';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const TYPE_OPTIONS = [
  { label: 'Chi phí', value: 'EXPENSE' },
  { label: 'Thu khác', value: 'INCOME' },
];

const CATEGORY_OPTIONS = [
  { label: 'Sửa chữa', value: 'repair' },
  { label: 'Bảo trì', value: 'maintenance' },
  { label: 'Điện nước', value: 'utility' },
  { label: 'Khác', value: 'other' },
];

export function ExpenseFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string[]>(['EXPENSE']);
  const [category, setCategory] = useState<string[]>(['other']);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const createExpense = useCreateExpense();

  const reset = () => {
    setType(['EXPENSE']); setCategory(['other']);
    setAmount(''); setDate(new Date().toISOString().split('T')[0]); setNote('');
  };

  const handleSubmit = async () => {
    if (!amount || !date) return;
    try {
      await createExpense.mutateAsync({
        propertyId,
        category: category[0] ?? 'other',
        type: type[0] as 'INCOME' | 'EXPENSE',
        amount: parseInt(amount),
        date,
        note: note || undefined,
      });
      reset();
      setOpen(false);
    } catch {}
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => { setOpen(false); reset(); }}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thêm thu/chi</h3>
            <Button fill="none" size="small" onClick={() => { setOpen(false); reset(); }} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-gray-400">Loại</p>
              <Selector
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
                style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties}
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Danh mục</p>
              <Selector
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={setCategory}
                style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties}
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Số tiền (VNĐ) *</p>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={setAmount}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ghi chú (tuỳ chọn)</p>
              <Input
                placeholder="Mô tả..."
                value={note}
                onChange={setNote}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
          </div>

          {createExpense.error && (
            <p className="mt-3 text-sm text-red-500">{(createExpense.error as Error).message}</p>
          )}

          <Button
            block color="primary" size="large"
            className="mt-5 !rounded-xl"
            loading={createExpense.isPending}
            disabled={!amount || !date}
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </div>
      </Popup>
    </>
  );
}
```

- [ ] **Step 2: Create Expenses Page**

`packages/frontend/src/app/(dashboard)/expenses/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, ErrorBlock, List, Skeleton, Dialog } from 'antd-mobile';
import { useExpenses, useDeleteExpense } from '@/hooks/use-expenses';
import { useProperty } from '@/contexts/property-context';
import { ExpenseFormModal } from '@/components/expenses/expense-form-modal';

const CATEGORY_LABEL: Record<string, string> = {
  repair: 'Sửa chữa',
  maintenance: 'Bảo trì',
  utility: 'Điện nước',
  other: 'Khác',
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function ExpensesPage() {
  const { propertyId } = useProperty();
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: expenses, isLoading } = useExpenses(propertyId, month);
  const deleteExpense = useDeleteExpense();

  const totalExpense = expenses?.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0) ?? 0;
  const totalIncome = expenses?.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0) ?? 0;

  const handleDelete = async (id: string, note: string | null) => {
    const confirmed = await Dialog.confirm({
      content: `Xoá khoản "${note ?? 'này'}"?`,
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
    });
    if (!confirmed) return;
    deleteExpense.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thu / Chi</h1>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-0.5 text-sm text-gray-400 bg-transparent outline-none"
          />
        </div>
        {propertyId && (
          <ExpenseFormModal
            propertyId={propertyId}
            trigger={
              <Button size="small" color="primary" className="!rounded-[20px]">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm
              </Button>
            }
          />
        )}
      </div>

      {/* Summary */}
      {expenses && expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs text-red-400">Chi phí</p>
            <p className="mt-1 text-lg font-bold text-red-600">
              {totalExpense.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-xs text-green-500">Thu khác</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {totalIncome.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-1/2" />
              <Skeleton.Paragraph lineCount={1} animated />
            </div>
          ))}
        </div>
      ) : !propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : expenses?.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có khoản thu/chi nào" />
      ) : (
        <List style={{ '--border-top': 'none', '--border-bottom': 'none' } as React.CSSProperties}>
          {expenses?.map((e) => (
            <List.Item
              key={e.id}
              description={`${CATEGORY_LABEL[e.category] ?? e.category} · ${new Date(e.date).toLocaleDateString('vi-VN')}${e.room ? ` · ${e.room.name}` : ''}`}
              extra={
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${e.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
                    {e.type === 'EXPENSE' ? '-' : '+'}{e.amount.toLocaleString('vi-VN')}đ
                  </span>
                  <Button
                    fill="none"
                    onClick={() => handleDelete(e.id, e.note)}
                    className="!text-red-400 !p-1 !min-w-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              {e.note ?? '—'}
            </List.Item>
          ))}
        </List>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/expenses/ packages/frontend/src/app/\(dashboard\)/expenses/
git commit -m "feat: add expenses FE page and form modal"
```

---

## Task 9: Reports FE — Page with Monthly Chart

**Files:**
- Create: `packages/frontend/src/app/(dashboard)/reports/page.tsx`

- [ ] **Step 1: Create Reports Page**

`packages/frontend/src/app/(dashboard)/reports/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { ErrorBlock, Skeleton } from 'antd-mobile';
import { useMonthlyReport, usePropertySnapshot } from '@/hooks/use-reports';
import { useProperty } from '@/contexts/property-context';

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function formatPrice(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return `${amount}`;
}

function BarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-end gap-0.5 w-full">
            <div
              className="flex-1 rounded-t bg-blue-400 min-h-[2px] transition-all"
              style={{ height: `${(d.income / maxVal) * 112}px` }}
            />
            <div
              className="flex-1 rounded-t bg-red-300 min-h-[2px] transition-all"
              style={{ height: `${(d.expense / maxVal) * 112}px` }}
            />
          </div>
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { propertyId } = useProperty();
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: monthly, isLoading: loadingMonthly } = useMonthlyReport(propertyId, year);
  const { data: snapshot } = usePropertySnapshot(propertyId);

  const chartData = (monthly ?? []).map((m, i) => ({
    label: MONTH_LABELS[i],
    income: m.totalCollected + m.totalOtherIncome,
    expense: m.totalExpenses,
  }));

  const yearTotal = monthly?.reduce(
    (acc, m) => ({
      collected: acc.collected + m.totalCollected,
      expenses: acc.expenses + m.totalExpenses,
      profit: acc.profit + m.profit,
    }),
    { collected: 0, expenses: 0, profit: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Báo cáo</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="px-2 py-1 text-gray-400 text-lg">‹</button>
          <span className="text-sm font-semibold text-gray-700">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="px-2 py-1 text-gray-400 text-lg">›</button>
        </div>
      </div>

      {!propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : (
        <>
          {/* Snapshot */}
          {snapshot && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-gray-900">{snapshot.occupiedRooms}</p>
                <p className="text-xs text-gray-400">Đang thuê</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600">{snapshot.totalCollectedThisMonth.toLocaleString('vi-VN').slice(0, -3)}k</p>
                <p className="text-xs text-gray-400">Thu tháng này</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-amber-500">{snapshot.pendingCount}</p>
                <p className="text-xs text-gray-400">Chưa trả</p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-xs text-gray-500">Thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="text-xs text-gray-500">Chi</span>
              </div>
            </div>
            {loadingMonthly ? (
              <Skeleton.Paragraph lineCount={4} animated />
            ) : (
              <BarChart data={chartData} />
            )}
          </div>

          {/* Year summary */}
          {yearTotal && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Tổng thu</span>
                <span className="font-semibold text-blue-600">
                  {yearTotal.collected.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Tổng chi</span>
                <span className="font-semibold text-red-500">
                  {yearTotal.expenses.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                <span className="text-sm font-semibold text-blue-700">Lợi nhuận</span>
                <span className={`font-bold ${yearTotal.profit >= 0 ? 'text-blue-700' : 'text-red-500'}`}>
                  {yearTotal.profit >= 0 ? '+' : ''}{yearTotal.profit.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          )}

          {/* Monthly table */}
          {monthly && (
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 gap-0 border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
                <span>Tháng</span>
                <span className="text-right">Thu</span>
                <span className="text-right">Chi</span>
                <span className="text-right">Lãi</span>
              </div>
              {monthly.map((m) => (
                <div key={m.month} className="grid grid-cols-4 border-b border-gray-50 px-4 py-2.5 text-sm last:border-0">
                  <span className="text-gray-600">{m.month.slice(5)}</span>
                  <span className="text-right text-blue-600">{formatPrice(m.totalCollected)}</span>
                  <span className="text-right text-red-400">{formatPrice(m.totalExpenses)}</span>
                  <span className={`text-right font-medium ${m.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.profit >= 0 ? '+' : ''}{formatPrice(m.profit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/\(dashboard\)/reports/
git commit -m "feat: add reports FE page with bar chart"
```

---

## Task 10: Feature Gating FE — Replace env var with API

**Files:**
- Modify: `packages/frontend/src/lib/features.ts`
- Modify: `packages/frontend/src/components/layout/sidebar.tsx`

- [ ] **Step 1: Update features.ts**

`packages/frontend/src/lib/features.ts`:
```typescript
export const isPremiumEnabled = process.env.NEXT_PUBLIC_PREMIUM_ENABLED === 'true';
export { FEATURE_KEYS } from '@room-manager/shared';
```

(Keep env var for quick override during dev; real feature check uses `useHasFeature` from `use-features.ts`)

- [ ] **Step 2: Update Sidebar to use real feature check**

In `packages/frontend/src/components/layout/sidebar.tsx`, replace the static `locked: !isPremiumEnabled` with `useHasFeature`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutGrid, DoorOpen, Receipt, Gauge, Settings,
  Users, FileText, TrendingUp, Wallet, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHasFeature, FEATURE_KEYS } from '@/hooks/use-features';
import { PremiumModal } from '@/components/premium/premium-modal';

const mainNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const hasContracts = useHasFeature(FEATURE_KEYS.CONTRACTS);
  const hasExpenses = useHasFeature(FEATURE_KEYS.EXPENSES);
  const hasReports = useHasFeature(FEATURE_KEYS.FINANCIAL_REPORTS);
  const hasMultiProperty = useHasFeature(FEATURE_KEYS.MULTI_PROPERTY);

  const premiumNavItems = [
    { href: '/tenants', label: 'Người thuê', icon: Users, locked: false },
    { href: '/contracts', label: 'Hợp đồng', icon: FileText, locked: !hasContracts },
    { href: '/expenses', label: 'Thu/Chi', icon: Wallet, locked: !hasExpenses },
    { href: '/reports', label: 'Báo cáo', icon: TrendingUp, locked: !hasReports },
  ];

  const handleNavClick = (href: string, locked: boolean) => {
    if (locked) setPremiumModalOpen(true);
    else router.push(href);
  };

  return (
    <>
      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-white">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg text-white">🏠</div>
          <div><p className="text-sm font-bold">Room Manager</p></div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  isActive ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <div className="my-2 border-t" />

          {premiumNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href, item.locked)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  isActive ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600' : 'text-gray-600 hover:bg-gray-50',
                  item.locked && 'opacity-60',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.locked && <Lock className="ml-auto h-3 w-3" />}
              </button>
            );
          })}
        </nav>
      </aside>

      <PremiumModal visible={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/lib/features.ts packages/frontend/src/components/layout/sidebar.tsx
git commit -m "feat: replace env-var feature gating with API-based check"
```

---

## Task 11: Push Notification FE — Subscribe flow

**Files:**
- Modify: `packages/frontend/src/components/dashboard/push-notification-banner.tsx`

- [ ] **Step 1: Update PushNotificationBanner to actually subscribe**

`packages/frontend/src/components/dashboard/push-notification-banner.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button, NoticeBar } from 'antd-mobile';
import { Bell } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationBanner() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') setState('done');
    if (Notification.permission === 'denied') setState('denied');
  }, []);

  if (state === 'done' || state === 'denied') return null;

  const handleSubscribe = async () => {
    setState('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setState('denied'); return; }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setState('idle'); return; }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint, p256dhKey: keys.p256dh, authKey: keys.auth }),
      });

      setState('done');
    } catch {
      setState('idle');
    }
  };

  return (
    <NoticeBar
      content={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Bật thông báo để nhận nhắc nhở thanh toán</span>
          </div>
          <Button
            size="mini"
            color="primary"
            loading={state === 'loading'}
            onClick={handleSubscribe}
            className="ml-2 !rounded-lg flex-shrink-0"
          >
            Bật
          </Button>
        </div>
      }
      color="info"
      closeable
    />
  );
}
```

Also add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to `packages/frontend/.env.local` — set it to the same value as `VAPID_PUBLIC_KEY` in `packages/backend/.env`.

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/components/dashboard/push-notification-banner.tsx
git commit -m "feat: wire push notification subscription flow"
```

---

## Task 12: Ad Banner FE — Dashboard banner

**Files:**
- Create: `packages/frontend/src/components/ads/ad-banner.tsx`
- Modify: `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create AdBanner component**

`packages/frontend/src/components/ads/ad-banner.tsx`:
```tsx
'use client';

import { useHasFeature, FEATURE_KEYS } from '@/hooks/use-features';

interface Props {
  position: 'top' | 'bottom';
}

export function AdBanner({ position }: Props) {
  const hasRemoveAds = useHasFeature(FEATURE_KEYS.REMOVE_ADS);

  // Hide for users who purchased remove_ads
  if (hasRemoveAds) return null;

  return (
    <div className={`w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${position === 'top' ? 'h-12' : 'h-16'}`}>
      {/* AdSense slot — replace with actual script in production */}
      <span>Quảng cáo</span>
    </div>
  );
}
```

- [ ] **Step 2: Add AdBanner to Dashboard**

In `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`, add at the top of the returned JSX (after the opening `<div className="space-y-4">`):

```tsx
import { AdBanner } from '@/components/ads/ad-banner';

// Inside return, at the top:
<AdBanner position="top" />
```

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/ads/ packages/frontend/src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add ad banner component with feature-gate hide"
```

---

## Task 13: BottomNav — use real feature gating

**Files:**
- Modify: `packages/frontend/src/components/layout/bottom-nav.tsx`

- [ ] **Step 1: Read current bottom-nav.tsx**

Read the file to see current structure, then replace static premium check with `useHasFeature`.

The bottom nav currently uses `isPremiumEnabled` to lock tabs. Replace with:
```tsx
import { useHasFeature, FEATURE_KEYS } from '@/hooks/use-features';

// Inside component:
const hasContracts = useHasFeature(FEATURE_KEYS.CONTRACTS);
```

Then use `hasContracts` in the locked condition instead of `!isPremiumEnabled`.

- [ ] **Step 2: Compile check**

```bash
cd packages/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/components/layout/bottom-nav.tsx
git commit -m "feat: bottom-nav uses real feature gating"
```

---

## Task 14: Final compile check

- [ ] **Step 1: Run TypeScript check on both packages**

```bash
cd packages/backend && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

Expected: Only the pre-existing 6 antd-mobile CSS var type errors in frontend, zero new errors.

- [ ] **Step 2: Run pnpm install to ensure lockfile is up to date**

```bash
cd /Users/comchientrung/company/room-manager && pnpm install
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup after all phase implementations"
```
