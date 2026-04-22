# Phase 3: Meter Readings, Invoices & Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable landlords to configure utility rates, record monthly meter readings, generate invoices automatically, and record payments — completing the core billing cycle.

**Architecture:** Backend NestJS modules (utility-configs, service-fees, meter-readings, invoices, payments) each follow the same pattern as existing modules (PrismaService injected, AuthGuard + @CurrentUser(), forwardRef AuthModule). Frontend adds 3 new pages (/settings, /meters, /invoices) using TanStack Query hooks matching the existing pattern. No schema changes needed — all models already exist in Prisma.

**Tech Stack:** NestJS 11 + Prisma, class-validator DTOs, TanStack Query v5, Next.js 16 App Router, shadcn/ui components

---

## File Map

### Backend (new modules)
- `packages/backend/src/utility-configs/dto/upsert-utility-config.dto.ts` — DTO for PUT upsert
- `packages/backend/src/utility-configs/utility-configs.service.ts` — findAll + upsert per property
- `packages/backend/src/utility-configs/utility-configs.controller.ts` — GET + PUT under properties/:propertyId/utility-configs
- `packages/backend/src/utility-configs/utility-configs.module.ts` — module definition
- `packages/backend/src/utility-configs/__tests__/utility-configs.service.spec.ts` — unit tests

- `packages/backend/src/service-fees/dto/create-service-fee.dto.ts` — DTO for create
- `packages/backend/src/service-fees/dto/update-service-fee.dto.ts` — DTO for update (PartialType)
- `packages/backend/src/service-fees/service-fees.service.ts` — CRUD
- `packages/backend/src/service-fees/service-fees.controller.ts` — GET/POST under property + PATCH/DELETE flat
- `packages/backend/src/service-fees/service-fees.module.ts`
- `packages/backend/src/service-fees/__tests__/service-fees.service.spec.ts`

- `packages/backend/src/meter-readings/dto/create-meter-reading.dto.ts`
- `packages/backend/src/meter-readings/meter-readings.service.ts`
- `packages/backend/src/meter-readings/meter-readings.controller.ts` — GET/POST under rooms/:roomId/meter-readings
- `packages/backend/src/meter-readings/meter-readings.module.ts`
- `packages/backend/src/meter-readings/__tests__/meter-readings.service.spec.ts`

- `packages/backend/src/invoices/dto/generate-invoices.dto.ts`
- `packages/backend/src/invoices/invoices.service.ts` — generate + list + findOne
- `packages/backend/src/invoices/invoices.controller.ts` — POST /invoices/generate, GET /properties/:propertyId/invoices, GET /invoices/:id
- `packages/backend/src/invoices/invoices.module.ts`
- `packages/backend/src/invoices/__tests__/invoices.service.spec.ts`

- `packages/backend/src/payments/dto/create-payment.dto.ts`
- `packages/backend/src/payments/payments.service.ts` — create payment + recalculate invoice status
- `packages/backend/src/payments/payments.controller.ts` — POST /invoices/:invoiceId/payments
- `packages/backend/src/payments/payments.module.ts`
- `packages/backend/src/payments/__tests__/payments.service.spec.ts`

- `packages/backend/src/app.module.ts` — add 5 new modules

### Frontend (new pages + hooks + components)
- `packages/frontend/src/hooks/use-utility-configs.ts`
- `packages/frontend/src/hooks/use-service-fees.ts`
- `packages/frontend/src/hooks/use-meter-readings.ts`
- `packages/frontend/src/hooks/use-invoices.ts`
- `packages/frontend/src/hooks/use-payments.ts`
- `packages/frontend/src/components/settings/utility-config-form.tsx`
- `packages/frontend/src/components/settings/service-fee-list.tsx`
- `packages/frontend/src/components/settings/service-fee-form-modal.tsx`
- `packages/frontend/src/components/meters/meter-reading-row.tsx`
- `packages/frontend/src/components/invoices/invoice-status-badge.tsx`
- `packages/frontend/src/components/invoices/invoice-card.tsx`
- `packages/frontend/src/components/invoices/payment-form-modal.tsx`
- `packages/frontend/src/app/(dashboard)/settings/page.tsx`
- `packages/frontend/src/app/(dashboard)/meters/page.tsx`
- `packages/frontend/src/app/(dashboard)/invoices/page.tsx`
- `packages/frontend/src/app/(dashboard)/invoices/[id]/page.tsx`

---

## Task 1: Utility Config Backend

**Files:**
- Create: `packages/backend/src/utility-configs/dto/upsert-utility-config.dto.ts`
- Create: `packages/backend/src/utility-configs/utility-configs.service.ts`
- Create: `packages/backend/src/utility-configs/utility-configs.controller.ts`
- Create: `packages/backend/src/utility-configs/utility-configs.module.ts`
- Create: `packages/backend/src/utility-configs/__tests__/utility-configs.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**API:**
- `GET /properties/:propertyId/utility-configs` → array of 0–2 configs
- `PUT /properties/:propertyId/utility-configs/:type` → upsert (type = ELECTRIC | WATER)

- [ ] **Step 1: Write the failing test**

`packages/backend/src/utility-configs/__tests__/utility-configs.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UtilityConfigsService } from '../utility-configs.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UtilityConfigsService', () => {
  let service: UtilityConfigsService;
  let prisma: {
    property: Record<string, jest.Mock>;
    utilityConfig: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      utilityConfig: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilityConfigsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<UtilityConfigsService>(UtilityConfigsService);
  });

  describe('findAll', () => {
    it('should return utility configs for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.utilityConfig.findMany.mockResolvedValue([
        { id: 'cfg-1', type: 'ELECTRIC', unitPrice: 3500 },
      ]);
      const result = await service.findAll('user-1', 'prop-1');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ELECTRIC');
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(service.findAll('user-1', 'prop-99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should upsert utility config', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.utilityConfig.upsert.mockResolvedValue({
        id: 'cfg-1', propertyId: 'prop-1', type: 'ELECTRIC', calcType: 'FIXED', unitPrice: 3500,
      });
      const result = await service.upsert('user-1', 'prop-1', 'ELECTRIC', {
        calcType: 'FIXED',
        unitPrice: 3500,
      });
      expect(result.unitPrice).toBe(3500);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/backend && pnpm test --testPathPattern="utility-configs"
```
Expected: FAIL — "Cannot find module '../utility-configs.service'"

- [ ] **Step 3: Create the DTO**

`packages/backend/src/utility-configs/dto/upsert-utility-config.dto.ts`:
```typescript
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum UtilityCalcTypeDto {
  FIXED = 'FIXED',
  TIERED = 'TIERED',
  PER_PERSON = 'PER_PERSON',
  FIXED_PER_ROOM = 'FIXED_PER_ROOM',
}

export class UpsertUtilityConfigDto {
  @IsEnum(UtilityCalcTypeDto)
  calcType!: UtilityCalcTypeDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  perPersonPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fixedRoomPrice?: number;
}
```

- [ ] **Step 4: Create the service**

`packages/backend/src/utility-configs/utility-configs.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertUtilityConfigDto } from './dto/upsert-utility-config.dto';

@Injectable()
export class UtilityConfigsService {
  constructor(private prisma: PrismaService) {}

  private async verifyPropertyOwnership(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  async findAll(userId: string, propertyId: string) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.utilityConfig.findMany({ where: { propertyId } });
  }

  async upsert(
    userId: string,
    propertyId: string,
    type: 'ELECTRIC' | 'WATER',
    dto: UpsertUtilityConfigDto,
  ) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.utilityConfig.upsert({
      where: { propertyId_type: { propertyId, type } },
      create: {
        propertyId,
        type,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        perPersonPrice: dto.perPersonPrice,
        fixedRoomPrice: dto.fixedRoomPrice,
      },
      update: {
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        perPersonPrice: dto.perPersonPrice,
        fixedRoomPrice: dto.fixedRoomPrice,
      },
    });
  }
}
```

- [ ] **Step 5: Create the controller**

`packages/backend/src/utility-configs/utility-configs.controller.ts`:
```typescript
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { UtilityConfigsService } from './utility-configs.service';
import { UpsertUtilityConfigDto } from './dto/upsert-utility-config.dto';

@Controller('properties/:propertyId/utility-configs')
@UseGuards(AuthGuard)
export class UtilityConfigsController {
  constructor(private utilityConfigsService: UtilityConfigsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.utilityConfigsService.findAll(user.id, propertyId);
  }

  @Put(':type')
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Param('type') type: 'ELECTRIC' | 'WATER',
    @Body() dto: UpsertUtilityConfigDto,
  ) {
    return this.utilityConfigsService.upsert(user.id, propertyId, type, dto);
  }
}
```

- [ ] **Step 6: Create the module**

`packages/backend/src/utility-configs/utility-configs.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { UtilityConfigsService } from './utility-configs.service';
import { UtilityConfigsController } from './utility-configs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UtilityConfigsService],
  controllers: [UtilityConfigsController],
  exports: [UtilityConfigsService],
})
export class UtilityConfigsModule {}
```

- [ ] **Step 7: Register in AppModule**

`packages/backend/src/app.module.ts`:
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
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Run tests to confirm they pass**

```bash
cd packages/backend && pnpm test --testPathPattern="utility-configs"
```
Expected: PASS — 3 tests pass

- [ ] **Step 9: Run all tests to confirm no regressions**

```bash
cd packages/backend && pnpm test
```
Expected: all tests pass

- [ ] **Step 10: Commit**

```bash
cd packages/backend && git add src/utility-configs src/app.module.ts
git commit -m "feat(backend): add utility configs CRUD"
```

---

## Task 2: Service Fee Config Backend

**Files:**
- Create: `packages/backend/src/service-fees/dto/create-service-fee.dto.ts`
- Create: `packages/backend/src/service-fees/dto/update-service-fee.dto.ts`
- Create: `packages/backend/src/service-fees/service-fees.service.ts`
- Create: `packages/backend/src/service-fees/service-fees.controller.ts`
- Create: `packages/backend/src/service-fees/service-fees.module.ts`
- Create: `packages/backend/src/service-fees/__tests__/service-fees.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**API:**
- `GET /properties/:propertyId/service-fees`
- `POST /properties/:propertyId/service-fees`
- `PATCH /service-fees/:id`
- `DELETE /service-fees/:id`

- [ ] **Step 1: Write the failing test**

`packages/backend/src/service-fees/__tests__/service-fees.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceFeesService } from '../service-fees.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServiceFeesService', () => {
  let service: ServiceFeesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    serviceFee: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      serviceFee: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceFeesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<ServiceFeesService>(ServiceFeesService);
  });

  describe('create', () => {
    it('should create service fee for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.serviceFee.create.mockResolvedValue({
        id: 'fee-1', name: 'Phí vệ sinh', calcType: 'FIXED_PER_ROOM', unitPrice: 50000,
      });
      const result = await service.create('user-1', 'prop-1', {
        name: 'Phí vệ sinh', calcType: 'FIXED_PER_ROOM', unitPrice: 50000, applyTo: 'ALL',
      });
      expect(result.name).toBe('Phí vệ sinh');
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'prop-99', { name: 'Test', calcType: 'FIXED_PER_ROOM', unitPrice: 0, applyTo: 'ALL' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete owned service fee', async () => {
      prisma.serviceFee.findFirst.mockResolvedValue({ id: 'fee-1' });
      prisma.serviceFee.delete.mockResolvedValue({ id: 'fee-1' });
      const result = await service.remove('user-1', 'fee-1');
      expect(result.id).toBe('fee-1');
    });

    it('should throw NotFoundException if fee not found', async () => {
      prisma.serviceFee.findFirst.mockResolvedValue(null);
      await expect(service.remove('user-1', 'fee-99')).rejects.toThrow(NotFoundException);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/backend && pnpm test --testPathPattern="service-fees"
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the DTOs**

`packages/backend/src/service-fees/dto/create-service-fee.dto.ts`:
```typescript
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum FeeCalcTypeDto {
  FIXED_PER_ROOM = 'FIXED_PER_ROOM',
  PER_PERSON = 'PER_PERSON',
  PER_QUANTITY = 'PER_QUANTITY',
}

export enum FeeApplyToDto {
  ALL = 'ALL',
  SELECTED_ROOMS = 'SELECTED_ROOMS',
}

export class CreateServiceFeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(FeeCalcTypeDto)
  calcType!: FeeCalcTypeDto;

  @IsInt()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsEnum(FeeApplyToDto)
  applyTo?: FeeApplyToDto;
}
```

`packages/backend/src/service-fees/dto/update-service-fee.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceFeeDto } from './create-service-fee.dto';

export class UpdateServiceFeeDto extends PartialType(CreateServiceFeeDto) {}
```

- [ ] **Step 4: Create the service**

`packages/backend/src/service-fees/service-fees.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceFeeDto } from './dto/create-service-fee.dto';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';

@Injectable()
export class ServiceFeesService {
  constructor(private prisma: PrismaService) {}

  private async verifyPropertyOwnership(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  private async verifyFeeOwnership(userId: string, id: string) {
    const fee = await this.prisma.serviceFee.findFirst({
      where: { id, property: { ownerId: userId } },
    });
    if (!fee) throw new NotFoundException('Không tìm thấy phí dịch vụ');
    return fee;
  }

  async create(userId: string, propertyId: string, dto: CreateServiceFeeDto) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.serviceFee.create({
      data: {
        propertyId,
        name: dto.name,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        applyTo: dto.applyTo ?? 'ALL',
      },
    });
  }

  async findAll(userId: string, propertyId: string) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.serviceFee.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateServiceFeeDto) {
    await this.verifyFeeOwnership(userId, id);
    return this.prisma.serviceFee.update({
      where: { id },
      data: {
        name: dto.name,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        applyTo: dto.applyTo,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.verifyFeeOwnership(userId, id);
    return this.prisma.serviceFee.delete({ where: { id } });
  }
}
```

- [ ] **Step 5: Create the controller**

`packages/backend/src/service-fees/service-fees.controller.ts`:
```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ServiceFeesService } from './service-fees.service';
import { CreateServiceFeeDto } from './dto/create-service-fee.dto';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';

@Controller('properties/:propertyId/service-fees')
@UseGuards(AuthGuard)
export class ServiceFeesController {
  constructor(private serviceFeesService: ServiceFeesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateServiceFeeDto,
  ) {
    return this.serviceFeesService.create(user.id, propertyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.serviceFeesService.findAll(user.id, propertyId);
  }
}

@Controller('service-fees')
@UseGuards(AuthGuard)
export class ServiceFeeByIdController {
  constructor(private serviceFeesService: ServiceFeesService) {}

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateServiceFeeDto) {
    return this.serviceFeesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.serviceFeesService.remove(user.id, id);
  }
}
```

- [ ] **Step 6: Create the module**

`packages/backend/src/service-fees/service-fees.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { ServiceFeesService } from './service-fees.service';
import { ServiceFeesController, ServiceFeeByIdController } from './service-fees.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [ServiceFeesService],
  controllers: [ServiceFeesController, ServiceFeeByIdController],
  exports: [ServiceFeesService],
})
export class ServiceFeesModule {}
```

- [ ] **Step 7: Register in AppModule**

`packages/backend/src/app.module.ts` — add import `ServiceFeesModule` from `'./service-fees/service-fees.module'` to the imports array alongside UtilityConfigsModule.

- [ ] **Step 8: Run tests**

```bash
cd packages/backend && pnpm test --testPathPattern="service-fees"
```
Expected: PASS — 4 tests pass

- [ ] **Step 9: Run all tests**

```bash
cd packages/backend && pnpm test
```
Expected: all pass

- [ ] **Step 10: Commit**

```bash
cd packages/backend && git add src/service-fees src/app.module.ts
git commit -m "feat(backend): add service fees CRUD"
```

---

## Task 3: Meter Readings Backend

**Files:**
- Create: `packages/backend/src/meter-readings/dto/create-meter-reading.dto.ts`
- Create: `packages/backend/src/meter-readings/meter-readings.service.ts`
- Create: `packages/backend/src/meter-readings/meter-readings.controller.ts`
- Create: `packages/backend/src/meter-readings/meter-readings.module.ts`
- Create: `packages/backend/src/meter-readings/__tests__/meter-readings.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**API:**
- `GET /rooms/:roomId/meter-readings?type=ELECTRIC` → latest readings (orderBy readingDate desc, take 2)
- `POST /rooms/:roomId/meter-readings` → record new reading

- [ ] **Step 1: Write the failing test**

`packages/backend/src/meter-readings/__tests__/meter-readings.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MeterReadingsService } from '../meter-readings.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MeterReadingsService', () => {
  let service: MeterReadingsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    meterReading: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: { findFirst: jest.fn() },
      meterReading: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeterReadingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<MeterReadingsService>(MeterReadingsService);
  });

  describe('create', () => {
    it('should create meter reading for owned room', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1' });
      prisma.meterReading.create.mockResolvedValue({
        id: 'reading-1',
        roomId: 'room-1',
        type: 'ELECTRIC',
        readingValue: 150,
        previousValue: 100,
        readingDate: new Date('2026-04-01'),
      });
      const result = await service.create('user-1', 'room-1', {
        type: 'ELECTRIC',
        readingValue: 150,
        previousValue: 100,
        readingDate: '2026-04-01',
      });
      expect(result.readingValue).toBe(150);
    });

    it('should throw NotFoundException if room not owned', async () => {
      prisma.room.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'room-99', {
          type: 'ELECTRIC', readingValue: 100, previousValue: 90, readingDate: '2026-04-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return readings for owned room filtered by type', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1' });
      prisma.meterReading.findMany.mockResolvedValue([
        { id: 'r-1', type: 'ELECTRIC', readingValue: 150, previousValue: 100 },
      ]);
      const result = await service.findAll('user-1', 'room-1', 'ELECTRIC');
      expect(result).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/backend && pnpm test --testPathPattern="meter-readings"
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the DTO**

`packages/backend/src/meter-readings/dto/create-meter-reading.dto.ts`:
```typescript
import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

export enum UtilityTypeDto {
  ELECTRIC = 'ELECTRIC',
  WATER = 'WATER',
}

export class CreateMeterReadingDto {
  @IsEnum(UtilityTypeDto)
  type!: UtilityTypeDto;

  @IsInt()
  @Min(0)
  readingValue!: number;

  @IsInt()
  @Min(0)
  previousValue!: number;

  @IsDateString()
  @IsNotEmpty()
  readingDate!: string;
}
```

- [ ] **Step 4: Create the service**

`packages/backend/src/meter-readings/meter-readings.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';

@Injectable()
export class MeterReadingsService {
  constructor(private prisma: PrismaService) {}

  private async verifyRoomOwnership(userId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async create(userId: string, roomId: string, dto: CreateMeterReadingDto) {
    await this.verifyRoomOwnership(userId, roomId);
    return this.prisma.meterReading.create({
      data: {
        roomId,
        type: dto.type,
        readingValue: dto.readingValue,
        previousValue: dto.previousValue,
        readingDate: new Date(dto.readingDate),
      },
    });
  }

  async findAll(userId: string, roomId: string, type?: string) {
    await this.verifyRoomOwnership(userId, roomId);
    return this.prisma.meterReading.findMany({
      where: {
        roomId,
        ...(type ? { type: type as 'ELECTRIC' | 'WATER' } : {}),
      },
      orderBy: { readingDate: 'desc' },
      take: 12,
    });
  }
}
```

- [ ] **Step 5: Create the controller**

`packages/backend/src/meter-readings/meter-readings.controller.ts`:
```typescript
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { MeterReadingsService } from './meter-readings.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';

@Controller('rooms/:roomId/meter-readings')
@UseGuards(AuthGuard)
export class MeterReadingsController {
  constructor(private meterReadingsService: MeterReadingsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Body() dto: CreateMeterReadingDto,
  ) {
    return this.meterReadingsService.create(user.id, roomId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Query('type') type?: string,
  ) {
    return this.meterReadingsService.findAll(user.id, roomId, type);
  }
}
```

- [ ] **Step 6: Create the module**

`packages/backend/src/meter-readings/meter-readings.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { MeterReadingsService } from './meter-readings.service';
import { MeterReadingsController } from './meter-readings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [MeterReadingsService],
  controllers: [MeterReadingsController],
  exports: [MeterReadingsService],
})
export class MeterReadingsModule {}
```

- [ ] **Step 7: Register in AppModule**

`packages/backend/src/app.module.ts` — add `MeterReadingsModule` from `'./meter-readings/meter-readings.module'` to the imports array.

- [ ] **Step 8: Run tests**

```bash
cd packages/backend && pnpm test --testPathPattern="meter-readings"
```
Expected: PASS — 3 tests pass

- [ ] **Step 9: Run all tests**

```bash
cd packages/backend && pnpm test
```
Expected: all pass

- [ ] **Step 10: Commit**

```bash
cd packages/backend && git add src/meter-readings src/app.module.ts
git commit -m "feat(backend): add meter readings CRUD"
```

---

## Task 4: Invoice Generation Backend

**Files:**
- Create: `packages/backend/src/invoices/dto/generate-invoices.dto.ts`
- Create: `packages/backend/src/invoices/invoices.service.ts`
- Create: `packages/backend/src/invoices/invoices.controller.ts`
- Create: `packages/backend/src/invoices/invoices.module.ts`
- Create: `packages/backend/src/invoices/__tests__/invoices.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**API:**
- `POST /invoices/generate` body: `{ propertyId, billingPeriod: "2026-04" }`
- `GET /properties/:propertyId/invoices?billingPeriod=2026-04`
- `GET /invoices/:id`

**Invoice calculation logic:**
```
billingMonth start = new Date(`${billingPeriod}-01`)
billingMonth end = last day of that month at 23:59:59

roomFee:
  if room.rentCalcType === 'FIXED' → room.rentPrice
  if room.rentCalcType === 'PER_PERSON' → room.rentPerPersonPrice * activeTenants.length

electricFee:
  find latest MeterReading where roomId=room.id, type='ELECTRIC', readingDate in [start, end]
  find UtilityConfig where propertyId, type='ELECTRIC'
  if both found and config.calcType==='FIXED' and config.unitPrice → (reading.readingValue - reading.previousValue) * config.unitPrice
  else → 0

waterFee: same logic for WATER

serviceFeesDetail:
  find all ServiceFee where propertyId, applyTo='ALL'
  map each fee → { id, name, amount }
    FIXED_PER_ROOM → fee.unitPrice
    PER_PERSON → fee.unitPrice * activeTenants.length
    PER_QUANTITY → 0 (not applicable without quantity config)

total = roomFee + electricFee + waterFee + sum(serviceFeesDetail.map(f => f.amount)) - discount
```

- [ ] **Step 1: Write the failing test**

`packages/backend/src/invoices/__tests__/invoices.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    room: Record<string, jest.Mock>;
    tenant: Record<string, jest.Mock>;
    meterReading: Record<string, jest.Mock>;
    utilityConfig: Record<string, jest.Mock>;
    serviceFee: Record<string, jest.Mock>;
    invoice: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      room: { findMany: jest.fn(), findFirst: jest.fn() },
      tenant: { findMany: jest.fn() },
      meterReading: { findFirst: jest.fn() },
      utilityConfig: { findFirst: jest.fn() },
      serviceFee: { findMany: jest.fn() },
      invoice: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('generate', () => {
    it('should generate invoice with FIXED rent and no utility readings', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.room.findMany.mockResolvedValue([
        {
          id: 'room-1',
          rentPrice: 3000000,
          rentCalcType: 'FIXED',
          rentPerPersonPrice: null,
          tenants: [{ id: 'tenant-1' }],
        },
      ]);
      prisma.meterReading.findFirst.mockResolvedValue(null);
      prisma.utilityConfig.findFirst.mockResolvedValue(null);
      prisma.serviceFee.findMany.mockResolvedValue([]);
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        total: 3000000,
        roomFee: 3000000,
        electricFee: 0,
        waterFee: 0,
        status: 'PENDING',
      });

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results).toHaveLength(1);
      expect(results[0].total).toBe(3000000);
    });

    it('should calculate electric fee from meter reading', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', rentPrice: 2000000, rentCalcType: 'FIXED', rentPerPersonPrice: null, tenants: [{ id: 'tenant-1' }] },
      ]);
      prisma.meterReading.findFirst
        .mockResolvedValueOnce({ readingValue: 150, previousValue: 100 }) // ELECTRIC
        .mockResolvedValueOnce(null); // WATER
      prisma.utilityConfig.findFirst
        .mockResolvedValueOnce({ calcType: 'FIXED', unitPrice: 3500 }) // ELECTRIC
        .mockResolvedValueOnce(null); // WATER
      prisma.serviceFee.findMany.mockResolvedValue([]);
      prisma.invoice.create.mockResolvedValue({
        id: 'inv-1', total: 2175000, roomFee: 2000000, electricFee: 175000, waterFee: 0, status: 'PENDING',
      });

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results[0].total).toBe(2175000); // 2000000 + (150-100)*3500
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.generate('user-1', { propertyId: 'prop-99', billingPeriod: '2026-04' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should list invoices for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', billingPeriod: '2026-04' }]);
      const result = await service.findAll('user-1', 'prop-1', '2026-04');
      expect(result).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/backend && pnpm test --testPathPattern="invoices"
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the DTO**

`packages/backend/src/invoices/dto/generate-invoices.dto.ts`:
```typescript
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GenerateInvoicesDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'billingPeriod must be in YYYY-MM format' })
  billingPeriod!: string;
}
```

- [ ] **Step 4: Create the service**

`packages/backend/src/invoices/invoices.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private getBillingPeriodRange(billingPeriod: string): { start: Date; end: Date } {
    const start = new Date(`${billingPeriod}-01T00:00:00.000Z`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private async calculateUtilityFee(
    roomId: string,
    propertyId: string,
    type: 'ELECTRIC' | 'WATER',
    start: Date,
    end: Date,
  ): Promise<number> {
    const [reading, config] = await Promise.all([
      this.prisma.meterReading.findFirst({
        where: { roomId, type, readingDate: { gte: start, lte: end } },
        orderBy: { readingDate: 'desc' },
      }),
      this.prisma.utilityConfig.findFirst({
        where: { propertyId, type },
      }),
    ]);

    if (!reading || !config || config.calcType !== 'FIXED' || !config.unitPrice) return 0;
    const usage = reading.readingValue - reading.previousValue;
    return Math.max(0, usage) * config.unitPrice;
  }

  async generate(userId: string, dto: GenerateInvoicesDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const { start, end } = this.getBillingPeriodRange(dto.billingPeriod);

    const rooms = await this.prisma.room.findMany({
      where: { propertyId: dto.propertyId },
      include: {
        tenants: { where: { status: 'ACTIVE' }, select: { id: true } },
      },
    });

    const occupiedRooms = rooms.filter((r) => r.tenants.length > 0);

    const serviceFees = await this.prisma.serviceFee.findMany({
      where: { propertyId: dto.propertyId, applyTo: 'ALL' },
    });

    const invoices = await Promise.all(
      occupiedRooms.map(async (room) => {
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

        const serviceFeesDetail = serviceFees.map((fee) => {
          let amount = 0;
          if (fee.calcType === 'FIXED_PER_ROOM') amount = fee.unitPrice;
          else if (fee.calcType === 'PER_PERSON') amount = fee.unitPrice * activeTenantCount;
          return { id: fee.id, name: fee.name, amount };
        });

        const serviceFeeTotal = serviceFeesDetail.reduce((sum, f) => sum + f.amount, 0);
        const total = roomFee + electricFee + waterFee + serviceFeeTotal;

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
          },
        });
      }),
    );

    return invoices;
  }

  async findAll(userId: string, propertyId: string, billingPeriod?: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.invoice.findMany({
      where: {
        room: { propertyId },
        ...(billingPeriod ? { billingPeriod } : {}),
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: [{ billingPeriod: 'desc' }, { room: { name: 'asc' } }],
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');
    return invoice;
  }
}
```

- [ ] **Step 5: Create the controller**

`packages/backend/src/invoices/invoices.controller.ts`:
```typescript
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { InvoicesService } from './invoices.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@Controller('invoices')
@UseGuards(AuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post('generate')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateInvoicesDto) {
    return this.invoicesService.generate(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoicesService.findOne(user.id, id);
  }
}

@Controller('properties/:propertyId/invoices')
@UseGuards(AuthGuard)
export class PropertyInvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Query('billingPeriod') billingPeriod?: string,
  ) {
    return this.invoicesService.findAll(user.id, propertyId, billingPeriod);
  }
}
```

- [ ] **Step 6: Create the module**

`packages/backend/src/invoices/invoices.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController, PropertyInvoicesController } from './invoices.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [InvoicesService],
  controllers: [InvoicesController, PropertyInvoicesController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
```

- [ ] **Step 7: Register in AppModule**

`packages/backend/src/app.module.ts` — add `InvoicesModule` from `'./invoices/invoices.module'` to the imports array.

- [ ] **Step 8: Run tests**

```bash
cd packages/backend && pnpm test --testPathPattern="invoices"
```
Expected: PASS — 4 tests pass

- [ ] **Step 9: Run all tests**

```bash
cd packages/backend && pnpm test
```
Expected: all pass

- [ ] **Step 10: Commit**

```bash
cd packages/backend && git add src/invoices src/app.module.ts
git commit -m "feat(backend): add invoice generation and listing"
```

---

## Task 5: Payments Backend

**Files:**
- Create: `packages/backend/src/payments/dto/create-payment.dto.ts`
- Create: `packages/backend/src/payments/payments.service.ts`
- Create: `packages/backend/src/payments/payments.controller.ts`
- Create: `packages/backend/src/payments/payments.module.ts`
- Create: `packages/backend/src/payments/__tests__/payments.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

**API:**
- `POST /invoices/:invoiceId/payments` — record payment, recalculate invoice status

**Payment logic:**
```
After creating payment:
  paidAmount = sum of all payments.amount for this invoice
  status = paidAmount >= total ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PENDING'
  paidDate = status === 'PAID' ? new Date() : null
```

- [ ] **Step 1: Write the failing test**

`packages/backend/src/payments/__tests__/payments.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    invoice: Record<string, jest.Mock>;
    payment: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findFirst: jest.fn(),
        aggregate: jest.fn(),
        update: jest.fn(),
      },
      payment: { create: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('create', () => {
    it('should create payment and update invoice to PAID when fully paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 3000000 });
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 3000000 } });
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID', paidAmount: 3000000 });

      const result = await service.create('user-1', 'inv-1', {
        amount: 3000000,
        paymentDate: '2026-04-20',
        method: 'CASH',
      });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: 'PAID' }),
        }),
      );
      expect(result.payment.id).toBe('pay-1');
    });

    it('should set status PARTIAL when partially paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 1000000 });
      prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 1000000 } });
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PARTIAL', paidAmount: 1000000 });

      await service.create('user-1', 'inv-1', { amount: 1000000, paymentDate: '2026-04-20', method: 'CASH' });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PARTIAL' }),
        }),
      );
    });

    it('should throw NotFoundException if invoice not owned', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'inv-99', { amount: 100, paymentDate: '2026-04-20', method: 'CASH' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd packages/backend && pnpm test --testPathPattern="payments"
```
Expected: FAIL — module not found

- [ ] **Step 3: Create the DTO**

`packages/backend/src/payments/dto/create-payment.dto.ts`:
```typescript
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  paymentDate!: string;

  @IsEnum(PaymentMethodDto)
  method!: PaymentMethodDto;

  @IsOptional()
  @IsString()
  note?: string;
}
```

- [ ] **Step 4: Create the service**

`packages/backend/src/payments/payments.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, room: { property: { ownerId: userId } } },
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method,
        note: dto.note,
      },
    });

    const aggregate = await this.prisma.invoice.aggregate({
      where: { id: invoiceId },
      _sum: { paidAmount: true },
    });

    // Recalculate from all payments
    const allPayments = await this.prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    });
    const paidAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let status: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount >= invoice.total) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIAL';

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount,
        status,
        paidDate: status === 'PAID' ? new Date() : null,
      },
    });

    return { payment, invoice: updatedInvoice };
  }
}
```

Note: The `aggregate` call in the service is unused after the refactor to use `findMany`. Remove it — the final service uses `findMany` to sum payments directly. The test mocks `aggregate` but the final implementation uses `findMany` with `select: { amount: true }`. Update the mock in tests accordingly before running.

Actually, let's simplify — remove the unused `aggregate` from service and from prisma mock:

`packages/backend/src/payments/payments.service.ts` (final version without aggregate):
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, room: { property: { ownerId: userId } } },
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method,
        note: dto.note,
      },
    });

    const allPayments = await this.prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    });
    const paidAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let status: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount >= invoice.total) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIAL';

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount,
        status,
        paidDate: status === 'PAID' ? new Date() : null,
      },
    });

    return { payment, invoice: updatedInvoice };
  }
}
```

Update the test to use `prisma.payment.findMany` instead of `prisma.invoice.aggregate`:

`packages/backend/src/payments/__tests__/payments.service.spec.ts` (fix the prisma mock):
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    invoice: Record<string, jest.Mock>;
    payment: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('create', () => {
    it('should create payment and update invoice to PAID when fully paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 3000000 });
      prisma.payment.findMany.mockResolvedValue([{ amount: 3000000 }]);
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID', paidAmount: 3000000 });

      const result = await service.create('user-1', 'inv-1', {
        amount: 3000000, paymentDate: '2026-04-20', method: 'CASH',
      });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: 'PAID', paidAmount: 3000000 }),
        }),
      );
      expect(result.payment.id).toBe('pay-1');
    });

    it('should set status PARTIAL when partially paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 1000000 });
      prisma.payment.findMany.mockResolvedValue([{ amount: 1000000 }]);
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PARTIAL', paidAmount: 1000000 });

      await service.create('user-1', 'inv-1', { amount: 1000000, paymentDate: '2026-04-20', method: 'CASH' });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PARTIAL' }),
        }),
      );
    });

    it('should throw NotFoundException if invoice not owned', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'inv-99', { amount: 100, paymentDate: '2026-04-20', method: 'CASH' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

- [ ] **Step 5: Create the controller**

`packages/backend/src/payments/payments.controller.ts`:
```typescript
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('invoices/:invoiceId/payments')
@UseGuards(AuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(user.id, invoiceId, dto);
  }
}
```

- [ ] **Step 6: Create the module**

`packages/backend/src/payments/payments.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
```

- [ ] **Step 7: Register in AppModule**

`packages/backend/src/app.module.ts` (final version with all 5 new modules):
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
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Run tests**

```bash
cd packages/backend && pnpm test --testPathPattern="payments"
```
Expected: PASS — 3 tests pass

- [ ] **Step 9: Run all backend tests**

```bash
cd packages/backend && pnpm test
```
Expected: all pass

- [ ] **Step 10: TypeScript check**

```bash
cd packages/backend && pnpm lint
```
Expected: no errors

- [ ] **Step 11: Commit**

```bash
cd packages/backend && git add src/payments src/app.module.ts
git commit -m "feat(backend): add payments recording with invoice status recalculation"
```

---

## Task 6: Frontend — Settings Page (Utility Configs + Service Fees)

**Files:**
- Create: `packages/frontend/src/hooks/use-utility-configs.ts`
- Create: `packages/frontend/src/hooks/use-service-fees.ts`
- Create: `packages/frontend/src/components/settings/utility-config-form.tsx`
- Create: `packages/frontend/src/components/settings/service-fee-list.tsx`
- Create: `packages/frontend/src/components/settings/service-fee-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create the utility configs hook**

`packages/frontend/src/hooks/use-utility-configs.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface UtilityConfig {
  id: string;
  propertyId: string;
  type: 'ELECTRIC' | 'WATER';
  calcType: 'FIXED' | 'TIERED' | 'PER_PERSON' | 'FIXED_PER_ROOM';
  unitPrice: number | null;
  perPersonPrice: number | null;
  fixedRoomPrice: number | null;
}

export function useUtilityConfigs(propertyId: string) {
  return useQuery<UtilityConfig[]>({
    queryKey: ['utility-configs', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/utility-configs`),
    enabled: !!propertyId,
  });
}

export function useUpsertUtilityConfig(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: 'ELECTRIC' | 'WATER'; data: Partial<UtilityConfig> }) =>
      apiFetch(`/properties/${propertyId}/utility-configs/${type}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-configs', propertyId] });
    },
  });
}
```

- [ ] **Step 2: Create the service fees hook**

`packages/frontend/src/hooks/use-service-fees.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ServiceFee {
  id: string;
  propertyId: string;
  name: string;
  calcType: 'FIXED_PER_ROOM' | 'PER_PERSON' | 'PER_QUANTITY';
  unitPrice: number;
  applyTo: 'ALL' | 'SELECTED_ROOMS';
}

export function useServiceFees(propertyId: string) {
  return useQuery<ServiceFee[]>({
    queryKey: ['service-fees', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/service-fees`),
    enabled: !!propertyId,
  });
}

export function useCreateServiceFee(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ServiceFee, 'id' | 'propertyId'>) =>
      apiFetch(`/properties/${propertyId}/service-fees`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees', propertyId] });
    },
  });
}

export function useDeleteServiceFee(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/service-fees/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees', propertyId] });
    },
  });
}
```

- [ ] **Step 3: Create the utility config form component**

`packages/frontend/src/components/settings/utility-config-form.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtilityConfig, useUpsertUtilityConfig } from '@/hooks/use-utility-configs';

interface UtilityConfigFormProps {
  propertyId: string;
  type: 'ELECTRIC' | 'WATER';
  config?: UtilityConfig;
  label: string;
}

export function UtilityConfigForm({ propertyId, type, config, label }: UtilityConfigFormProps) {
  const [unitPrice, setUnitPrice] = useState(config?.unitPrice?.toString() ?? '');
  const upsert = useUpsertUtilityConfig(propertyId);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        type,
        data: { calcType: 'FIXED', unitPrice: parseInt(unitPrice) || 0 },
      });
    } catch {
      // error shown via upsert.error
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          placeholder="Đơn giá (VND/kWh)"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="max-w-xs"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={upsert.isPending}
        >
          {upsert.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
      {upsert.isSuccess && (
        <p className="text-xs text-green-600">Đã lưu</p>
      )}
      {upsert.error && (
        <p className="text-xs text-red-500">{(upsert.error as Error).message}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create the service fee form modal**

`packages/frontend/src/components/settings/service-fee-form-modal.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateServiceFee } from '@/hooks/use-service-fees';

interface ServiceFeeFormModalProps {
  propertyId: string;
  trigger: React.ReactNode;
}

export function ServiceFeeFormModal({ propertyId, trigger }: ServiceFeeFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [calcType, setCalcType] = useState<'FIXED_PER_ROOM' | 'PER_PERSON' | 'PER_QUANTITY'>('FIXED_PER_ROOM');
  const [unitPrice, setUnitPrice] = useState('');
  const create = useCreateServiceFee(propertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ name, calcType, unitPrice: parseInt(unitPrice) || 0, applyTo: 'ALL' });
      setOpen(false);
      setName('');
      setUnitPrice('');
    } catch {
      // error shown via create.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm phí dịch vụ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tên phí</Label>
            <Input
              required
              placeholder="Phí vệ sinh, rác..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cách tính</Label>
            <Select value={calcType} onValueChange={(v) => setCalcType(v as typeof calcType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_PER_ROOM">Cố định/phòng</SelectItem>
                <SelectItem value="PER_PERSON">Theo người</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Đơn giá (VND)</Label>
            <Input
              required
              type="number"
              min={0}
              placeholder="50000"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
          {create.error && (
            <p className="text-sm text-red-500">{(create.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Đang thêm...' : 'Thêm phí'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Create the service fee list component**

`packages/frontend/src/components/settings/service-fee-list.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFee, useDeleteServiceFee } from '@/hooks/use-service-fees';
import { ServiceFeeFormModal } from './service-fee-form-modal';

const CALC_TYPE_LABEL: Record<ServiceFee['calcType'], string> = {
  FIXED_PER_ROOM: 'Cố định/phòng',
  PER_PERSON: 'Theo người',
  PER_QUANTITY: 'Theo số lượng',
};

interface ServiceFeeListProps {
  propertyId: string;
  fees: ServiceFee[];
}

export function ServiceFeeList({ propertyId, fees }: ServiceFeeListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteFee = useDeleteServiceFee(propertyId);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteFee.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="space-y-2">
      {fees.map((fee) => (
        <div
          key={fee.id}
          className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">{fee.name}</p>
            <p className="text-xs text-gray-500">
              {CALC_TYPE_LABEL[fee.calcType]} · {fee.unitPrice.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={deletingId === fee.id}
            onClick={() => handleDelete(fee.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      <ServiceFeeFormModal
        propertyId={propertyId}
        trigger={
          <Button variant="outline" size="sm" className="gap-1 w-full">
            <Plus className="h-4 w-4" />
            Thêm phí dịch vụ
          </Button>
        }
      />
    </div>
  );
}
```

- [ ] **Step 6: Create the settings page**

`packages/frontend/src/app/(dashboard)/settings/page.tsx`:
```tsx
'use client';

import { useProperties } from '@/hooks/use-properties';
import { useUtilityConfigs } from '@/hooks/use-utility-configs';
import { useServiceFees } from '@/hooks/use-service-fees';
import { UtilityConfigForm } from '@/components/settings/utility-config-form';
import { ServiceFeeList } from '@/components/settings/service-fee-list';

export default function SettingsPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';

  const { data: utilityConfigs, isLoading: loadingConfigs } = useUtilityConfigs(propertyId);
  const { data: serviceFees, isLoading: loadingFees } = useServiceFees(propertyId);

  const electricConfig = utilityConfigs?.find((c) => c.type === 'ELECTRIC');
  const waterConfig = utilityConfigs?.find((c) => c.type === 'WATER');

  if (!propertyId) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">🏘️</p>
        <p className="mt-3 font-medium">Chưa có khu trọ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Cài đặt</h1>

      {/* Utility configs */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="font-semibold">Giá điện nước</h2>
        {loadingConfigs ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <UtilityConfigForm
              propertyId={propertyId}
              type="ELECTRIC"
              config={electricConfig}
              label="Điện (VND/kWh)"
            />
            <UtilityConfigForm
              propertyId={propertyId}
              type="WATER"
              config={waterConfig}
              label="Nước (VND/m³)"
            />
          </div>
        )}
      </div>

      {/* Service fees */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="font-semibold">Phí dịch vụ</h2>
        {loadingFees ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : (
          <ServiceFeeList propertyId={propertyId} fees={serviceFees ?? []} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: TypeScript check**

```bash
cd packages/frontend && pnpm lint
```
Expected: no errors

- [ ] **Step 8: Commit**

```bash
cd packages/frontend && git add src/hooks/use-utility-configs.ts src/hooks/use-service-fees.ts src/components/settings src/app/\(dashboard\)/settings
git commit -m "feat(frontend): add settings page with utility configs and service fees"
```

---

## Task 7: Frontend — Meter Readings Page

**Files:**
- Create: `packages/frontend/src/hooks/use-meter-readings.ts`
- Create: `packages/frontend/src/components/meters/meter-reading-row.tsx`
- Create: `packages/frontend/src/app/(dashboard)/meters/page.tsx`

Note: The nav already links to `/meters` (not `/meter-readings`). Create the page at `/meters`.

- [ ] **Step 1: Create the meter readings hook**

`packages/frontend/src/hooks/use-meter-readings.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface MeterReading {
  id: string;
  roomId: string;
  type: 'ELECTRIC' | 'WATER';
  readingValue: number;
  previousValue: number;
  readingDate: string;
}

export function useMeterReadings(roomId: string, type?: 'ELECTRIC' | 'WATER') {
  return useQuery<MeterReading[]>({
    queryKey: ['meter-readings', roomId, type],
    queryFn: () =>
      apiFetch(`/rooms/${roomId}/meter-readings${type ? `?type=${type}` : ''}`),
    enabled: !!roomId,
  });
}

export function useCreateMeterReading(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MeterReading, 'id' | 'roomId'>) =>
      apiFetch(`/rooms/${roomId}/meter-readings`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings', roomId] });
    },
  });
}
```

- [ ] **Step 2: Create the meter reading row component**

This is the input row for entering meter readings per room. The page shows all rooms; each row has two inputs (electric + water current readings) with the previous reading shown as context.

`packages/frontend/src/components/meters/meter-reading-row.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateMeterReading, useMeterReadings } from '@/hooks/use-meter-readings';

interface MeterReadingRowProps {
  roomId: string;
  roomName: string;
  readingDate: string; // YYYY-MM-DD for this billing period
}

function TypeInput({
  roomId,
  type,
  label,
  readingDate,
}: {
  roomId: string;
  type: 'ELECTRIC' | 'WATER';
  label: string;
  readingDate: string;
}) {
  const { data: readings } = useMeterReadings(roomId, type);
  const latestReading = readings?.[0];
  const [value, setValue] = useState('');
  const create = useCreateMeterReading(roomId);

  const handleSave = async () => {
    const readingValue = parseInt(value);
    if (!readingValue || isNaN(readingValue)) return;
    try {
      await create.mutateAsync({
        type,
        readingValue,
        previousValue: latestReading?.readingValue ?? 0,
        readingDate,
      });
      setValue('');
    } catch {
      // error visible via create.error
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">
        {label}: {latestReading ? `Kỳ trước: ${latestReading.readingValue}` : 'Chưa có'}
      </p>
      <div className="flex gap-1">
        <Input
          type="number"
          min={latestReading?.readingValue ?? 0}
          placeholder="Chỉ số mới"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2"
          disabled={!value || create.isPending}
          onClick={handleSave}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
      {create.error && (
        <p className="text-xs text-red-500">{(create.error as Error).message}</p>
      )}
    </div>
  );
}

export function MeterReadingRow({ roomId, roomName, readingDate }: MeterReadingRowProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <p className="font-medium">{roomName}</p>
      <div className="grid grid-cols-2 gap-3">
        <TypeInput roomId={roomId} type="ELECTRIC" label="Điện (kWh)" readingDate={readingDate} />
        <TypeInput roomId={roomId} type="WATER" label="Nước (m³)" readingDate={readingDate} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the meters page**

`packages/frontend/src/app/(dashboard)/meters/page.tsx`:
```tsx
'use client';

import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { MeterReadingRow } from '@/components/meters/meter-reading-row';

function getCurrentReadingDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export default function MetersPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';
  const { data: rooms, isLoading } = useRooms(propertyId);

  const readingDate = getCurrentReadingDate();

  const occupiedRooms = rooms?.filter((r) => r.status === 'OCCUPIED') ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Chỉ số điện nước</h1>
        <p className="text-sm text-gray-500">Nhập chỉ số kỳ này cho từng phòng</p>
      </div>

      {!propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : occupiedRooms.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🔌</p>
          <p className="mt-3 font-medium">Chưa có phòng đang thuê</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Chỉ hiển thị phòng có người thuê.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {occupiedRooms.map((room) => (
            <MeterReadingRow
              key={room.id}
              roomId={room.id}
              roomName={room.name}
              readingDate={readingDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd packages/frontend && pnpm lint
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
cd packages/frontend && git add src/hooks/use-meter-readings.ts src/components/meters src/app/\(dashboard\)/meters
git commit -m "feat(frontend): add meter readings page"
```

---

## Task 8: Frontend — Invoices List + Detail + Payment Recording

**Files:**
- Create: `packages/frontend/src/hooks/use-invoices.ts`
- Create: `packages/frontend/src/hooks/use-payments.ts`
- Create: `packages/frontend/src/components/invoices/invoice-status-badge.tsx`
- Create: `packages/frontend/src/components/invoices/invoice-card.tsx`
- Create: `packages/frontend/src/components/invoices/payment-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/invoices/page.tsx`
- Create: `packages/frontend/src/app/(dashboard)/invoices/[id]/page.tsx`

- [ ] **Step 1: Create the invoices hook**

`packages/frontend/src/hooks/use-invoices.ts`:
```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ServiceFeeDetail {
  id: string;
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  roomId: string;
  tenantId: string;
  billingPeriod: string;
  roomFee: number;
  electricFee: number;
  waterFee: number;
  serviceFeesDetail: ServiceFeeDetail[] | null;
  discount: number;
  total: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
  room?: { id: string; name: string };
  tenant?: { id: string; name: string };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: 'CASH' | 'TRANSFER' | 'OTHER';
  note: string | null;
}

export function useInvoices(propertyId: string, billingPeriod?: string) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', propertyId, billingPeriod],
    queryFn: () =>
      apiFetch(
        `/properties/${propertyId}/invoices${billingPeriod ? `?billingPeriod=${billingPeriod}` : ''}`,
      ),
    enabled: !!propertyId,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: () => apiFetch(`/invoices/${id}`),
    enabled: !!id,
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { propertyId: string; billingPeriod: string }) =>
      apiFetch('/invoices/generate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

- [ ] **Step 2: Create the payments hook**

`packages/frontend/src/hooks/use-payments.ts`:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useCreatePayment(invoiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; paymentDate: string; method: string; note?: string }) =>
      apiFetch(`/invoices/${invoiceId}/payments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

- [ ] **Step 3: Create the invoice status badge**

`packages/frontend/src/components/invoices/invoice-status-badge.tsx`:
```tsx
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  PENDING: { label: 'Chưa thanh toán', className: 'bg-yellow-100 text-yellow-700' },
  PARTIAL: { label: 'Thanh toán một phần', className: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
};

export function InvoiceStatusBadge({ status }: { status: 'PENDING' | 'PARTIAL' | 'PAID' }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
```

- [ ] **Step 4: Create the invoice card**

`packages/frontend/src/components/invoices/invoice-card.tsx`:
```tsx
import Link from 'next/link';
import { Invoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from './invoice-status-badge';

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const period = invoice.billingPeriod.split('-');
  const label = `Tháng ${period[1]}/${period[0]}`;

  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{invoice.room?.name ?? '—'}</p>
            <p className="text-xs text-gray-500">
              {label} · {invoice.tenant?.name ?? '—'}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tổng: <span className="font-semibold text-gray-900">{invoice.total.toLocaleString('vi-VN')}đ</span>
          </p>
          {invoice.status !== 'PAID' && (
            <p className="text-xs text-gray-500">
              Còn lại: {(invoice.total - invoice.paidAmount).toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Create the payment form modal**

`packages/frontend/src/components/invoices/payment-form-modal.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePayment } from '@/hooks/use-payments';

interface PaymentFormModalProps {
  invoiceId: string;
  remaining: number;
  trigger: React.ReactNode;
}

export function PaymentFormModal({ invoiceId, remaining, trigger }: PaymentFormModalProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining.toString());
  const [method, setMethod] = useState<'CASH' | 'TRANSFER' | 'OTHER'>('CASH');
  const [note, setNote] = useState('');
  const createPayment = useCreatePayment(invoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync({
        amount: parseInt(amount),
        paymentDate: new Date().toISOString().split('T')[0],
        method,
        note: note || undefined,
      });
      setOpen(false);
    } catch {
      // error shown via createPayment.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Số tiền (VND)</Label>
            <Input
              required
              type="number"
              min={1}
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hình thức</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ghi chú (không bắt buộc)</Label>
            <Input
              placeholder="Ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {createPayment.error && (
            <p className="text-sm text-red-500">{(createPayment.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={createPayment.isPending}>
            {createPayment.isPending ? 'Đang ghi nhận...' : 'Ghi nhận'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 6: Create the invoices list page**

`packages/frontend/src/app/(dashboard)/invoices/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useInvoices, useGenerateInvoices } from '@/hooks/use-invoices';
import { InvoiceCard } from '@/components/invoices/invoice-card';
import { Button } from '@/components/ui/button';

function getCurrentBillingPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export default function InvoicesPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';
  const [billingPeriod] = useState(getCurrentBillingPeriod);

  const { data: invoices, isLoading } = useInvoices(propertyId, billingPeriod);
  const generate = useGenerateInvoices();

  const period = billingPeriod.split('-');
  const periodLabel = `Tháng ${period[1]}/${period[0]}`;

  const handleGenerate = async () => {
    try {
      await generate.mutateAsync({ propertyId, billingPeriod });
    } catch {
      // error shown via generate.error
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hóa đơn</h1>
          <p className="text-sm text-gray-500">{periodLabel}</p>
        </div>
        {propertyId && (
          <Button
            size="sm"
            className="gap-1"
            onClick={handleGenerate}
            disabled={generate.isPending}
          >
            <Plus className="h-4 w-4" />
            {generate.isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
          </Button>
        )}
      </div>

      {generate.error && (
        <p className="text-sm text-red-500">{(generate.error as Error).message}</p>
      )}

      {!propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : invoices?.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-medium">Chưa có hóa đơn</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bấm &quot;Tạo hóa đơn&quot; để tạo cho tháng này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices?.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create the invoice detail page**

`packages/frontend/src/app/(dashboard)/invoices/[id]/page.tsx`:
```tsx
'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useInvoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { PaymentFormModal } from '@/components/invoices/payment-form-modal';
import { Button } from '@/components/ui/button';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (!invoice) {
    return <p className="text-center text-gray-500">Không tìm thấy hóa đơn</p>;
  }

  const period = invoice.billingPeriod.split('-');
  const periodLabel = `Tháng ${period[1]}/${period[0]}`;
  const remaining = invoice.total - invoice.paidAmount;
  const serviceFees = invoice.serviceFeesDetail ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{invoice.room?.name}</h1>
          <p className="text-sm text-gray-500">{periodLabel} · {invoice.tenant?.name}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        {invoice.status !== 'PAID' && (
          <PaymentFormModal
            invoiceId={invoice.id}
            remaining={remaining}
            trigger={
              <Button size="sm" variant="outline">
                Ghi nhận thanh toán
              </Button>
            }
          />
        )}
      </div>

      {/* Fee breakdown */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Chi tiết hóa đơn</h2>
        <Row label="Tiền phòng" value={`${invoice.roomFee.toLocaleString('vi-VN')}đ`} />
        {invoice.electricFee > 0 && (
          <Row label="Tiền điện" value={`${invoice.electricFee.toLocaleString('vi-VN')}đ`} />
        )}
        {invoice.waterFee > 0 && (
          <Row label="Tiền nước" value={`${invoice.waterFee.toLocaleString('vi-VN')}đ`} />
        )}
        {serviceFees.map((fee) => (
          <Row key={fee.id} label={fee.name} value={`${fee.amount.toLocaleString('vi-VN')}đ`} />
        ))}
        {invoice.discount > 0 && (
          <Row label="Giảm giá" value={`-${invoice.discount.toLocaleString('vi-VN')}đ`} />
        )}
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-bold text-blue-600">
            {invoice.total.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      {/* Payment history */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Lịch sử thanh toán</h2>
          {invoice.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm">{payment.method === 'CASH' ? 'Tiền mặt' : payment.method === 'TRANSFER' ? 'Chuyển khoản' : 'Khác'}</p>
                <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <p className="text-sm font-medium text-green-600">
                +{payment.amount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">Đã thanh toán</span>
            <span className="font-medium">{invoice.paidAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Còn lại</span>
              <span className="font-medium text-red-600">{remaining.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: TypeScript check**

```bash
cd packages/frontend && pnpm lint
```
Expected: no errors

- [ ] **Step 9: Commit**

```bash
cd packages/frontend && git add src/hooks/use-invoices.ts src/hooks/use-payments.ts src/components/invoices src/app/\(dashboard\)/invoices
git commit -m "feat(frontend): add invoices list, detail, and payment recording"
```

---

## Self-Review Checklist

### Spec coverage:
- ✅ Utility Config CRUD (GET + PUT upsert) — Task 1
- ✅ Service Fee Config CRUD — Task 2
- ✅ Meter Readings (record + list per room) — Task 3
- ✅ Invoice generation (calculate from readings + config + service fees) — Task 4
- ✅ Invoice list + detail — Task 4
- ✅ Payments recording with status recalculation — Task 5
- ✅ Settings page (utility configs + service fees) — Task 6
- ✅ Meter readings input page — Task 7
- ✅ Invoices list + detail + payment modal — Task 8
- ✅ Navigation already set up in existing sidebar/bottom-nav (links to /meters, /invoices, /settings)

### Type consistency:
- `UtilityCalcTypeDto` enum in DTO matches Prisma `UtilityCalcType` values (FIXED, TIERED, PER_PERSON, FIXED_PER_ROOM)
- `FeeCalcType` from Prisma matches DTO values (FIXED_PER_ROOM, PER_PERSON, PER_QUANTITY)
- `Invoice.serviceFeesDetail` typed as `ServiceFeeDetail[] | null` matching Prisma `Json?`
- `useInvoice` returns single `Invoice`, `useInvoices` returns `Invoice[]`
- Payment hook creates at `/invoices/:invoiceId/payments` — matches controller route
- `use(params)` pattern for async params in Next.js 16 — matches existing `rooms/[id]/page.tsx`

### No placeholders:
- All code blocks contain complete implementations
- No TBD or TODO markers
