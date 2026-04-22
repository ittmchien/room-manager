# Phase 2: Properties, Rooms & Tenants CRUD

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD for Properties, Rooms, and Tenants — backend REST API (NestJS) + frontend UI (Next.js 16).

**Architecture:** Backend follows the same module pattern as `users/` (service + controller + DTOs + tests). Frontend adds React Query provider, auto-auth API client, and route pages for `/rooms` and `/rooms/[id]`. Feature-gating: property limit enforced at create (free = 1 property), room limit enforced at create (free = 10 rooms).

**Tech Stack:** NestJS 11, Prisma, class-validator, Next.js 16, TanStack React Query v5, TailwindCSS, Shadcn/Radix UI

---

## File Structure

```
packages/backend/src/
├── properties/
│   ├── properties.module.ts
│   ├── properties.service.ts
│   ├── properties.controller.ts
│   ├── dto/
│   │   ├── create-property.dto.ts
│   │   └── update-property.dto.ts
│   └── __tests__/
│       └── properties.service.spec.ts
├── rooms/
│   ├── rooms.module.ts
│   ├── rooms.service.ts
│   ├── rooms.controller.ts
│   ├── dto/
│   │   ├── create-room.dto.ts
│   │   └── update-room.dto.ts
│   └── __tests__/
│       └── rooms.service.spec.ts
├── tenants/
│   ├── tenants.module.ts
│   ├── tenants.service.ts
│   ├── tenants.controller.ts
│   ├── dto/
│   │   ├── create-tenant.dto.ts
│   │   └── update-tenant.dto.ts
│   └── __tests__/
│       └── tenants.service.spec.ts
└── app.module.ts                         # add PropertiesModule, RoomsModule, TenantsModule

packages/frontend/src/
├── app/
│   ├── layout.tsx                        # add QueryClientProvider
│   └── (dashboard)/
│       ├── rooms/
│       │   ├── page.tsx                  # rooms list + add modal
│       │   └── [id]/
│       │       └── page.tsx              # room detail + tenants
│       └── dashboard/
│           └── page.tsx                  # real data (rooms count, revenue)
├── components/
│   ├── rooms/
│   │   ├── room-card.tsx
│   │   ├── room-status-badge.tsx
│   │   └── room-form-modal.tsx
│   └── tenants/
│       ├── tenant-list.tsx
│       └── tenant-form-modal.tsx
├── hooks/
│   ├── use-rooms.ts
│   └── use-tenants.ts
└── lib/
    └── api-client.ts                     # auto-auth apiFetch wrapper
```

---

### Task 1: Properties NestJS Module

**Files:**
- Create: `packages/backend/src/properties/dto/create-property.dto.ts`
- Create: `packages/backend/src/properties/dto/update-property.dto.ts`
- Create: `packages/backend/src/properties/properties.service.ts`
- Create: `packages/backend/src/properties/properties.controller.ts`
- Create: `packages/backend/src/properties/properties.module.ts`
- Create: `packages/backend/src/properties/__tests__/properties.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/properties/dto/create-property.dto.ts`:
```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;
}
```

Create `packages/backend/src/properties/dto/update-property.dto.ts`:
```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;
}
```

- [ ] **Step 2: Write service test**

Create `packages/backend/src/properties/__tests__/properties.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    userFeature: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userFeature: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe('create', () => {
    it('should create first property on free tier', async () => {
      prisma.property.count.mockResolvedValue(0);
      prisma.userFeature.findUnique.mockResolvedValue(null);
      prisma.property.create.mockResolvedValue({
        id: 'prop-1',
        ownerId: 'user-1',
        name: 'Nhà trọ A',
        address: null,
      });

      const result = await service.create('user-1', { name: 'Nhà trọ A' });

      expect(prisma.property.count).toHaveBeenCalledWith({ where: { ownerId: 'user-1' } });
      expect(result.name).toBe('Nhà trọ A');
    });

    it('should throw ForbiddenException when free user tries to add second property', async () => {
      prisma.property.count.mockResolvedValue(1);
      prisma.userFeature.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', { name: 'Nhà trọ B' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow second property if user has MULTI_PROPERTY feature', async () => {
      prisma.property.count.mockResolvedValue(1);
      prisma.userFeature.findUnique.mockResolvedValue({ featureKey: 'multi_property' });
      prisma.property.create.mockResolvedValue({
        id: 'prop-2',
        ownerId: 'user-1',
        name: 'Nhà trọ B',
        address: null,
      });

      const result = await service.create('user-1', { name: 'Nhà trọ B' });
      expect(result.name).toBe('Nhà trọ B');
    });
  });

  describe('findAll', () => {
    it('should return properties for user', async () => {
      prisma.property.findMany.mockResolvedValue([
        { id: 'prop-1', name: 'Nhà trọ A', ownerId: 'user-1' },
      ]);

      const result = await service.findAll('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        include: { _count: { select: { rooms: true } } },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if property not owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'prop-99')).rejects.toThrow(NotFoundException);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="properties.service.spec" 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '../properties.service'`

- [ ] **Step 4: Implement properties service**

Create `packages/backend/src/properties/properties.service.ts`:
```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const FREE_PROPERTY_LIMIT = 1;

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePropertyDto) {
    const count = await this.prisma.property.count({ where: { ownerId: userId } });

    if (count >= FREE_PROPERTY_LIMIT) {
      const hasFeature = await this.prisma.userFeature.findUnique({
        where: { userId_featureKey: { userId, featureKey: 'multi_property' } },
      });
      if (!hasFeature) {
        throw new ForbiddenException(
          'Nâng cấp để quản lý nhiều khu trọ',
        );
      }
    }

    return this.prisma.property.create({
      data: { ownerId: userId, name: dto.name, address: dto.address },
    });
  }

  async findAll(userId: string) {
    return this.prisma.property.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { rooms: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, ownerId: userId },
      include: { _count: { select: { rooms: true } } },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  async update(userId: string, id: string, dto: UpdatePropertyDto) {
    await this.findOne(userId, id);
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.property.delete({ where: { id } });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="properties.service.spec" 2>&1 | tail -10
```

Expected: 4 tests PASS.

- [ ] **Step 6: Create controller and module**

Create `packages/backend/src/properties/properties.controller.ts`:
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('properties')
@UseGuards(AuthGuard)
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.propertiesService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.propertiesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.propertiesService.remove(user.id, id);
  }
}
```

Create `packages/backend/src/properties/properties.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [PropertiesService],
  controllers: [PropertiesController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
```

- [ ] **Step 7: Update app.module.ts**

Update `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/src/properties packages/backend/src/app.module.ts
git commit -m "feat: add properties module with multi_property feature gate"
```

---

### Task 2: Rooms NestJS Module

**Files:**
- Create: `packages/backend/src/rooms/dto/create-room.dto.ts`
- Create: `packages/backend/src/rooms/dto/update-room.dto.ts`
- Create: `packages/backend/src/rooms/rooms.service.ts`
- Create: `packages/backend/src/rooms/rooms.controller.ts`
- Create: `packages/backend/src/rooms/rooms.module.ts`
- Create: `packages/backend/src/rooms/__tests__/rooms.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/rooms/dto/create-room.dto.ts`:
```typescript
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum RentCalcType {
  FIXED = 'FIXED',
  PER_PERSON = 'PER_PERSON',
}

export class CreateRoomDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsInt()
  @Min(0)
  rentPrice: number;

  @IsEnum(RentCalcType)
  @IsOptional()
  rentCalcType?: RentCalcType;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPerPersonPrice?: number;
}
```

Create `packages/backend/src/rooms/dto/update-room.dto.ts`:
```typescript
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum RentCalcType {
  FIXED = 'FIXED',
  PER_PERSON = 'PER_PERSON',
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPrice?: number;

  @IsEnum(RentCalcType)
  @IsOptional()
  rentCalcType?: RentCalcType;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPerPersonPrice?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;
}
```

- [ ] **Step 2: Write service test**

Create `packages/backend/src/rooms/__tests__/rooms.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from '../rooms.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    property: Record<string, jest.Mock>;
    userFeature: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      property: {
        findFirst: jest.fn(),
      },
      userFeature: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe('create', () => {
    it('should create room when under free limit', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([]);
      prisma.room.count.mockResolvedValue(5);
      prisma.room.create.mockResolvedValue({ id: 'room-1', name: 'P101', propertyId: 'prop-1' });

      const result = await service.create('user-1', 'prop-1', {
        name: 'P101',
        rentPrice: 2000000,
      });

      expect(result.name).toBe('P101');
    });

    it('should throw ForbiddenException when at free limit (10 rooms)', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([]);
      prisma.room.count.mockResolvedValue(10);

      await expect(
        service.create('user-1', 'prop-1', { name: 'P101', rentPrice: 2000000 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow 20 rooms with one slots_room purchase', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([
        { featureKey: 'rooms_slot' },
      ]);
      prisma.room.count.mockResolvedValue(10);
      prisma.room.create.mockResolvedValue({ id: 'room-11', name: 'P111', propertyId: 'prop-1' });

      const result = await service.create('user-1', 'prop-1', {
        name: 'P111',
        rentPrice: 2000000,
      });
      expect(result.name).toBe('P111');
    });

    it('should throw NotFoundException if property not owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'prop-99', { name: 'P101', rentPrice: 0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByProperty', () => {
    it('should return rooms for a property owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', name: 'P101', status: 'VACANT' },
      ]);

      const result = await service.findAllByProperty('user-1', 'prop-1');
      expect(result).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="rooms.service.spec" 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '../rooms.service'`

- [ ] **Step 4: Implement rooms service**

Create `packages/backend/src/rooms/rooms.service.ts`:
```typescript
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

const FREE_ROOM_LIMIT = 10;
const SLOT_SIZE = 10;
const ROOMS_50_LIMIT = 50;

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  private async getRoomLimit(userId: string): Promise<number> {
    const features = await this.prisma.userFeature.findMany({
      where: { userId },
      select: { featureKey: true },
    });

    const featureKeys = features.map((f) => f.featureKey);

    if (featureKeys.includes('rooms_50')) return ROOMS_50_LIMIT;

    const slotCount = featureKeys.filter((k) => k === 'rooms_slot').length;
    return FREE_ROOM_LIMIT + slotCount * SLOT_SIZE;
  }

  async create(userId: string, propertyId: string, dto: CreateRoomDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const [totalRooms, limit] = await Promise.all([
      this.prisma.room.count({
        where: { property: { ownerId: userId } },
      }),
      this.getRoomLimit(userId),
    ]);

    if (totalRooms >= limit) {
      throw new ForbiddenException(
        `Đã đạt giới hạn ${limit} phòng. Mua thêm slot để mở rộng.`,
      );
    }

    return this.prisma.room.create({
      data: {
        propertyId,
        name: dto.name,
        floor: dto.floor,
        rentPrice: dto.rentPrice,
        rentCalcType: dto.rentCalcType ?? 'FIXED',
        rentPerPersonPrice: dto.rentPerPersonPrice,
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.room.findMany({
      where: { propertyId },
      include: {
        tenants: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true, phone: true },
        },
        _count: { select: { tenants: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, property: { ownerId: userId } },
      include: {
        property: { select: { id: true, name: true } },
        tenants: {
          where: { status: 'ACTIVE' },
          orderBy: { moveInDate: 'asc' },
        },
        _count: { select: { tenants: { where: { status: 'ACTIVE' } } } },
      },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async update(userId: string, id: string, dto: UpdateRoomDto) {
    await this.findOne(userId, id);
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.room.delete({ where: { id } });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="rooms.service.spec" 2>&1 | tail -10
```

Expected: 5 tests PASS.

- [ ] **Step 6: Create controller and module**

Create `packages/backend/src/rooms/rooms.controller.ts`:
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('properties/:propertyId/rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(user.id, propertyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.roomsService.findAllByProperty(user.id, propertyId);
  }
}

// Separate controller for /rooms/:id routes (no propertyId needed)
@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomByIdController {
  constructor(private roomsService: RoomsService) {}

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roomsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roomsService.remove(user.id, id);
  }
}
```

Create `packages/backend/src/rooms/rooms.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController, RoomByIdController } from './rooms.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RoomsService],
  controllers: [RoomsController, RoomByIdController],
  exports: [RoomsService],
})
export class RoomsModule {}
```

- [ ] **Step 7: Update app.module.ts**

Update `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    RoomsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Run all tests**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test 2>&1 | tail -15
```

Expected: All tests pass.

- [ ] **Step 9: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/src/rooms packages/backend/src/app.module.ts
git commit -m "feat: add rooms module with room count limit enforcement"
```

---

### Task 3: Tenants NestJS Module

**Files:**
- Create: `packages/backend/src/tenants/dto/create-tenant.dto.ts`
- Create: `packages/backend/src/tenants/dto/update-tenant.dto.ts`
- Create: `packages/backend/src/tenants/tenants.service.ts`
- Create: `packages/backend/src/tenants/tenants.controller.ts`
- Create: `packages/backend/src/tenants/tenants.module.ts`
- Create: `packages/backend/src/tenants/__tests__/tenants.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/tenants/dto/create-tenant.dto.ts`:
```typescript
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  idCard?: string;

  @IsString()
  @IsOptional()
  idCardImage?: string;

  @IsDateString()
  moveInDate: string;
}
```

Create `packages/backend/src/tenants/dto/update-tenant.dto.ts`:
```typescript
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  MOVED_OUT = 'MOVED_OUT',
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  idCard?: string;

  @IsString()
  @IsOptional()
  idCardImage?: string;

  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
```

- [ ] **Step 2: Write service test**

Create `packages/backend/src/tenants/__tests__/tenants.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from '../tenants.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    tenant: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: { findFirst: jest.fn() },
      tenant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  describe('create', () => {
    it('should create tenant for valid room', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1', property: { ownerId: 'user-1' } });
      prisma.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'Nguyễn Văn A',
        roomId: 'room-1',
        status: 'ACTIVE',
      });

      const result = await service.create('user-1', 'room-1', {
        name: 'Nguyễn Văn A',
        moveInDate: '2026-04-01',
      });

      expect(result.name).toBe('Nguyễn Văn A');
    });

    it('should throw NotFoundException if room not owned by user', async () => {
      prisma.room.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'room-99', { name: 'Test', moveInDate: '2026-04-01' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkout', () => {
    it('should set status to MOVED_OUT and set moveOutDate', async () => {
      prisma.tenant.findFirst.mockResolvedValue({
        id: 'tenant-1',
        roomId: 'room-1',
        room: { property: { ownerId: 'user-1' } },
      });
      prisma.tenant.update.mockResolvedValue({
        id: 'tenant-1',
        status: 'MOVED_OUT',
        moveOutDate: new Date(),
      });

      const result = await service.checkout('user-1', 'tenant-1');
      expect(prisma.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tenant-1' },
          data: expect.objectContaining({ status: 'MOVED_OUT' }),
        }),
      );
      expect(result.status).toBe('MOVED_OUT');
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="tenants.service.spec" 2>&1 | tail -5
```

Expected: FAIL — `Cannot find module '../tenants.service'`

- [ ] **Step 4: Implement tenants service**

Create `packages/backend/src/tenants/tenants.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  private async verifyRoomOwnership(userId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async create(userId: string, roomId: string, dto: CreateTenantDto) {
    await this.verifyRoomOwnership(userId, roomId);

    return this.prisma.tenant.create({
      data: {
        roomId,
        name: dto.name,
        phone: dto.phone,
        idCard: dto.idCard,
        idCardImage: dto.idCardImage,
        moveInDate: new Date(dto.moveInDate),
        status: 'ACTIVE',
      },
    });
  }

  async findAllByRoom(userId: string, roomId: string) {
    await this.verifyRoomOwnership(userId, roomId);

    return this.prisma.tenant.findMany({
      where: { roomId },
      orderBy: [{ status: 'asc' }, { moveInDate: 'desc' }],
    });
  }

  async update(userId: string, id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
    });
    if (!tenant) throw new NotFoundException('Không tìm thấy người thuê');

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...dto,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        moveOutDate: dto.moveOutDate ? new Date(dto.moveOutDate) : undefined,
      },
    });
  }

  async checkout(userId: string, id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
    });
    if (!tenant) throw new NotFoundException('Không tìm thấy người thuê');

    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'MOVED_OUT', moveOutDate: new Date() },
    });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="tenants.service.spec" 2>&1 | tail -10
```

Expected: 3 tests PASS.

- [ ] **Step 6: Create controller and module**

Create `packages/backend/src/tenants/tenants.controller.ts`:
```typescript
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('rooms/:roomId/tenants')
@UseGuards(AuthGuard)
export class TenantsByRoomController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(user.id, roomId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('roomId') roomId: string) {
    return this.tenantsService.findAllByRoom(user.id, roomId);
  }
}

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user.id, id, dto);
  }

  @Post(':id/checkout')
  checkout(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tenantsService.checkout(user.id, id);
  }
}
```

Create `packages/backend/src/tenants/tenants.module.ts`:
```typescript
import { Module, forwardRef } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsByRoomController, TenantsController } from './tenants.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [TenantsService],
  controllers: [TenantsByRoomController, TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
```

- [ ] **Step 7: Update app.module.ts**

Update `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    RoomsModule,
    TenantsModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Run all backend tests**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test 2>&1 | tail -15
```

Expected: All tests pass (properties + rooms + tenants + auth + users = ~12 tests).

- [ ] **Step 9: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/src/tenants packages/backend/src/app.module.ts
git commit -m "feat: add tenants module with checkout flow"
```

---

### Task 4: Frontend — React Query Setup + Auto-Auth API Client

**Files:**
- Modify: `packages/frontend/src/app/layout.tsx`
- Modify: `packages/frontend/src/lib/api.ts`
- Create: `packages/frontend/src/lib/query-client.ts`
- Create: `packages/frontend/src/hooks/use-rooms.ts`

- [ ] **Step 1: Create QueryClient singleton**

Create `packages/frontend/src/lib/query-client.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,  // 1 minute
      retry: 1,
    },
  },
});
```

- [ ] **Step 2: Add QueryClientProvider to root layout**

Read `packages/frontend/src/app/layout.tsx` first, then create a client-side providers wrapper.

Create `packages/frontend/src/components/providers.tsx`:
```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Update `packages/frontend/src/app/layout.tsx` to wrap children with Providers:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Room Manager',
  description: 'Quản lý phòng trọ dễ dàng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update api.ts to auto-get Supabase token**

Overwrite `packages/frontend/src/lib/api.ts`:
```typescript
import { createBrowserClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getAccessToken(): Promise<string | null> {
  const supabase = createBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 4: Create rooms hooks**

Create `packages/frontend/src/hooks/use-rooms.ts`:
```typescript
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  floor: number | null;
  rentPrice: number;
  rentCalcType: 'FIXED' | 'PER_PERSON';
  rentPerPersonPrice: number | null;
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
  tenants: { id: string; name: string; phone: string | null }[];
  _count: { tenants: number };
}

export interface CreateRoomInput {
  name: string;
  floor?: number;
  rentPrice: number;
  rentCalcType?: 'FIXED' | 'PER_PERSON';
  rentPerPersonPrice?: number;
}

export interface UpdateRoomInput {
  name?: string;
  floor?: number;
  rentPrice?: number;
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
}

export function useRooms(propertyId: string) {
  return useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: () => apiFetch<Room[]>(`/properties/${propertyId}/rooms`),
    enabled: !!propertyId,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => apiFetch<Room>(`/rooms/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomInput) =>
      apiFetch<Room>(`/properties/${propertyId}/rooms`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomInput }) =>
      apiFetch<Room>(`/rooms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
```

- [ ] **Step 5: Create properties hook**

Create `packages/frontend/src/hooks/use-properties.ts`:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Property {
  id: string;
  name: string;
  address: string | null;
  _count: { rooms: number };
}

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => apiFetch<Property[]>('/properties'),
  });
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
npx tsc --noEmit 2>&1 | head -20
```

Fix any type errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend/src
git commit -m "feat: setup React Query provider and auto-auth API client with hooks"
```

---

### Task 5: Frontend — Rooms List Page + Add Room Modal

**Files:**
- Create: `packages/frontend/src/components/rooms/room-status-badge.tsx`
- Create: `packages/frontend/src/components/rooms/room-card.tsx`
- Create: `packages/frontend/src/components/rooms/room-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/rooms/page.tsx`

- [ ] **Step 1: Install Shadcn components needed**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
npx shadcn@latest add dialog select --yes 2>&1 | tail -10
```

- [ ] **Step 2: Create room status badge**

Create `packages/frontend/src/components/rooms/room-status-badge.tsx`:
```tsx
import { cn } from '@/lib/utils';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  VACANT: { label: 'Trống', className: 'bg-gray-100 text-gray-600' },
  OCCUPIED: { label: 'Đang thuê', className: 'bg-blue-100 text-blue-700' },
  MAINTENANCE: { label: 'Sửa chữa', className: 'bg-orange-100 text-orange-700' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **Step 3: Create room card**

Create `packages/frontend/src/components/rooms/room-card.tsx`:
```tsx
import Link from 'next/link';
import { Room } from '@/hooks/use-rooms';
import { RoomStatusBadge } from './room-status-badge';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function RoomCard({ room }: { room: Room }) {
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{room.name}</span>
          {room.floor != null && (
            <span className="text-xs text-gray-400">Tầng {room.floor}</span>
          )}
        </div>
        <span className="text-sm text-gray-500">{formatPrice(room.rentPrice)}/tháng</span>
        {firstTenant && (
          <span className="text-sm text-gray-600">
            {firstTenant.name}
            {activeTenantsCount > 1 && ` +${activeTenantsCount - 1}`}
          </span>
        )}
      </div>
      <RoomStatusBadge status={room.status} />
    </Link>
  );
}
```

- [ ] **Step 4: Create add room modal**

Create `packages/frontend/src/components/rooms/room-form-modal.tsx`:
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
import { useCreateRoom } from '@/hooks/use-rooms';

interface RoomFormModalProps {
  propertyId: string;
  trigger: React.ReactNode;
}

export function RoomFormModal({ propertyId, trigger }: RoomFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const createRoom = useCreateRoom(propertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rentPrice) return;

    await createRoom.mutateAsync({
      name,
      floor: floor ? parseInt(floor) : undefined,
      rentPrice: parseInt(rentPrice),
    });

    setName('');
    setFloor('');
    setRentPrice('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-2">
            <Label>Tên/Số phòng</Label>
            <Input
              placeholder="VD: Phòng 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tầng (tuỳ chọn)</Label>
            <Input
              type="number"
              placeholder="1"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Giá thuê/tháng (VNĐ)</Label>
            <Input
              type="number"
              placeholder="2000000"
              value={rentPrice}
              onChange={(e) => setRentPrice(e.target.value)}
              required
              min={0}
            />
          </div>
          {createRoom.error && (
            <p className="text-sm text-red-500">{(createRoom.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={createRoom.isPending}>
            {createRoom.isPending ? 'Đang thêm...' : 'Thêm phòng'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Create rooms list page**

Create `packages/frontend/src/app/(dashboard)/rooms/page.tsx`:
```tsx
'use client';

import { Plus } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { RoomCard } from '@/components/rooms/room-card';
import { RoomFormModal } from '@/components/rooms/room-form-modal';
import { Button } from '@/components/ui/button';

export default function RoomsPage() {
  const { data: properties, isLoading: loadingProps } = useProperties();

  // Use first property by default (multi-property in Phase 4)
  const propertyId = properties?.[0]?.id ?? '';
  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);

  const isLoading = loadingProps || loadingRooms;

  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Phòng trọ</h1>
          {rooms && (
            <p className="text-sm text-gray-500">
              {occupiedCount}/{rooms.length} đang thuê · {vacantCount} trống
            </p>
          )}
        </div>
        {propertyId && (
          <RoomFormModal
            propertyId={propertyId}
            trigger={
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Thêm phòng
              </Button>
            }
          />
        )}
      </div>

      {/* Room list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : !propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hoàn thành onboarding để thiết lập khu trọ đầu tiên.
          </p>
        </div>
      ) : rooms?.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏠</p>
          <p className="mt-3 font-medium">Chưa có phòng nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bấm "Thêm phòng" để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms?.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
pnpm build 2>&1 | tail -15
```

Fix any errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend/src
git commit -m "feat: add rooms list page with add room modal"
```

---

### Task 6: Frontend — Room Detail Page + Tenant Management

**Files:**
- Create: `packages/frontend/src/hooks/use-tenants.ts`
- Create: `packages/frontend/src/components/tenants/tenant-list.tsx`
- Create: `packages/frontend/src/components/tenants/tenant-form-modal.tsx`
- Create: `packages/frontend/src/app/(dashboard)/rooms/[id]/page.tsx`

- [ ] **Step 1: Create tenants hook**

Create `packages/frontend/src/hooks/use-tenants.ts`:
```typescript
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Tenant {
  id: string;
  roomId: string;
  name: string;
  phone: string | null;
  idCard: string | null;
  moveInDate: string;
  moveOutDate: string | null;
  status: 'ACTIVE' | 'MOVED_OUT';
}

export interface CreateTenantInput {
  name: string;
  phone?: string;
  idCard?: string;
  moveInDate: string;
}

export function useTenants(roomId: string) {
  return useQuery({
    queryKey: ['tenants', roomId],
    queryFn: () => apiFetch<Tenant[]>(`/rooms/${roomId}/tenants`),
    enabled: !!roomId,
  });
}

export function useCreateTenant(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) =>
      apiFetch<Tenant>(`/rooms/${roomId}/tenants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useCheckoutTenant(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) =>
      apiFetch<Tenant>(`/tenants/${tenantId}/checkout`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
```

- [ ] **Step 2: Create add tenant modal**

Create `packages/frontend/src/components/tenants/tenant-form-modal.tsx`:
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

interface TenantFormModalProps {
  roomId: string;
  trigger: React.ReactNode;
}

export function TenantFormModal({ roomId, trigger }: TenantFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const createTenant = useCreateTenant(roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !moveInDate) return;

    await createTenant.mutateAsync({
      name,
      phone: phone || undefined,
      idCard: idCard || undefined,
      moveInDate,
    });

    setName('');
    setPhone('');
    setIdCard('');
    setOpen(false);
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
            <p className="text-sm text-red-500">{(createTenant.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={createTenant.isPending}>
            {createTenant.isPending ? 'Đang thêm...' : 'Thêm người thuê'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Create tenant list component**

Create `packages/frontend/src/components/tenants/tenant-list.tsx`:
```tsx
'use client';

import { UserRound } from 'lucide-react';
import { Tenant, useCheckoutTenant } from '@/hooks/use-tenants';
import { Button } from '@/components/ui/button';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function TenantList({ tenants, roomId }: { tenants: Tenant[]; roomId: string }) {
  const checkout = useCheckoutTenant(roomId);

  const active = tenants.filter((t) => t.status === 'ACTIVE');
  const movedOut = tenants.filter((t) => t.status === 'MOVED_OUT');

  return (
    <div className="space-y-3">
      {active.length === 0 && movedOut.length === 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          Chưa có người thuê
        </div>
      )}

      {active.map((tenant) => (
        <div
          key={tenant.id}
          className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{tenant.name}</p>
              {tenant.phone && (
                <p className="text-sm text-gray-500">{tenant.phone}</p>
              )}
              <p className="text-xs text-gray-400">
                Vào {formatDate(tenant.moveInDate)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => checkout.mutate(tenant.id)}
            disabled={checkout.isPending}
          >
            Trả phòng
          </Button>
        </div>
      ))}

      {movedOut.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-400">
            {movedOut.length} người đã trả phòng
          </summary>
          <div className="mt-2 space-y-2">
            {movedOut.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <UserRound className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tenant.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tenant.moveInDate)} → {tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '?'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create room detail page**

Create `packages/frontend/src/app/(dashboard)/rooms/[id]/page.tsx`:
```tsx
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { useRoom, useUpdateRoom } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';
import { RoomStatusBadge } from '@/components/rooms/room-status-badge';
import { TenantList } from '@/components/tenants/tenant-list';
import { TenantFormModal } from '@/components/tenants/tenant-form-modal';
import { Button } from '@/components/ui/button';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: room, isLoading: loadingRoom } = useRoom(id);
  const { data: tenants, isLoading: loadingTenants } = useTenants(id);
  const updateRoom = useUpdateRoom();

  const handleStatusChange = (status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE') => {
    updateRoom.mutate({ id, data: { status } });
  };

  if (loadingRoom) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-32 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-8 text-gray-500">Không tìm thấy phòng</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{room.name}</h1>
              {room.floor != null && (
                <span className="text-sm text-gray-400">Tầng {room.floor}</span>
              )}
            </div>
            <RoomStatusBadge status={room.status} />
          </div>
        </div>
      </div>

      {/* Room info card */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          GIÁ THUÊ
        </p>
        <p className="mt-1 text-2xl font-bold">{formatPrice(room.rentPrice)}</p>
        <p className="text-sm text-gray-500">
          {room.rentCalcType === 'FIXED' ? 'Giá cố định/tháng' : 'Theo đầu người'}
        </p>

        {/* Status change */}
        <div className="mt-4 flex gap-2">
          {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                room.status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'VACANT' ? 'Trống' : s === 'OCCUPIED' ? 'Đang thuê' : 'Sửa chữa'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Người thuê</h2>
          <TenantFormModal
            roomId={id}
            trigger={
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Thêm
              </Button>
            }
          />
        </div>
        {loadingTenants ? (
          <div className="h-20 animate-pulse rounded-xl bg-white" />
        ) : (
          <TenantList tenants={tenants ?? []} roomId={id} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
pnpm build 2>&1 | tail -15
```

Fix any errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend/src
git commit -m "feat: add room detail page with tenant management"
```

---

## Phase Summary

After completing all 6 tasks, you will have:

- **Properties API:** `GET/POST /properties`, `GET/PATCH/DELETE /properties/:id` — with multi_property feature gate
- **Rooms API:** `GET/POST /properties/:propertyId/rooms`, `GET/PATCH/DELETE /rooms/:id` — with room count limit (10 free, expandable)
- **Tenants API:** `GET/POST /rooms/:roomId/tenants`, `PATCH /tenants/:id`, `POST /tenants/:id/checkout`
- **Frontend:** React Query provider, `/rooms` list page with add modal, `/rooms/[id]` detail page with tenant management

## Next Phases

- **Phase 3:** Meter readings (ghi điện/nước), service fee config, invoice generation, payments
- **Phase 4:** Feature-gating UI, store/pricing page, purchase flow, ads
- **Phase 5:** Contracts, expenses, financial reports
- **Phase 6:** Push notifications, PWA
