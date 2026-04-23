# Admin Panel — Plan 1: Foundation + Admin Core

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin panel foundation (routing restructure, role-based auth, system config) and core admin pages (users, tags, billing/feature grants, system settings).

**Architecture:** Monolith Next.js frontend with two route groups: `(app)` for mobile (antd-mobile) and `(admin)` for desktop (Ant Design). Backend adds `/api/v1/admin/*` endpoints with role-based guards. System config moves business settings from env vars to DB.

**Tech Stack:** Next.js 16, Ant Design 6, NestJS 11, Prisma, PostgreSQL (Supabase), Jest 29

**Spec:** `docs/superpowers/specs/2026-04-23-admin-panel-design.md`

---

## File Structure

### Backend — New files

```
packages/backend/src/
├── admin/
│   ├── admin.module.ts
│   ├── guards/
│   │   ├── roles.guard.ts
│   │   └── roles.decorator.ts
│   ├── users/
│   │   ├── admin-users.controller.ts
│   │   ├── admin-users.service.ts
│   │   └── dto/
│   │       ├── list-users.dto.ts
│   │       └── update-user.dto.ts
│   ├── tags/
│   │   ├── admin-tags.controller.ts
│   │   ├── admin-tags.service.ts
│   │   └── dto/
│   │       ├── create-tag.dto.ts
│   │       └── bulk-assign-tag.dto.ts
│   ├── billing/
│   │   ├── admin-billing.controller.ts
│   │   ├── admin-billing.service.ts
│   │   └── dto/
│   │       ├── grant-features.dto.ts
│   │       └── revoke-feature.dto.ts
│   └── config/
│       ├── admin-config.controller.ts
│       ├── config.service.ts
│       └── dto/
│           └── update-config.dto.ts
```

### Backend — Modified files

```
packages/backend/prisma/schema.prisma          — add UserRole enum, role+tags on User, Tag model, SystemConfig model
packages/backend/src/app.module.ts              — import AdminModule
packages/backend/src/users/users.service.ts     — return role in upsert
packages/shared/src/types/user.ts               — add role to AuthUser
packages/shared/src/constants/features.ts       — export UserRole enum
```

### Frontend — New files

```
packages/frontend/src/app/
├── (app)/
│   ├── layout.tsx                              — mobile wrapper layout
│   ├── (auth)/
│   │   ├── login/page.tsx                      — moved from (auth)/login
│   │   └── register/page.tsx                   — moved from (auth)/register
│   ├── (dashboard)/
│   │   ├── layout.tsx                          — moved from (dashboard)/layout
│   │   └── ... all existing dashboard pages    — moved
│   └── onboarding/page.tsx                     — moved
├── (admin)/
│   ├── layout.tsx                              — Antd desktop layout (Sider+Header+Content)
│   ├── (auth)/
│   │   └── admin-login/page.tsx                — admin login page
│   ├── admin/
│   │   ├── page.tsx                            — placeholder dashboard
│   │   ├── users/
│   │   │   ├── page.tsx                        — users table
│   │   │   └── [id]/page.tsx                   — user detail
│   │   ├── tags/page.tsx                       — tags management
│   │   ├── billing/page.tsx                    — subscriptions + feature grants
│   │   └── settings/page.tsx                   — system config
```

### Frontend — Modified files

```
packages/frontend/src/app/layout.tsx            — strip mobile wrapper, keep shared root
packages/frontend/src/proxy.ts                  — add admin route handling
packages/frontend/src/lib/supabase/middleware.ts — add admin role check
packages/frontend/package.json                  — move antd to dependencies
packages/frontend/next.config.ts                — add antd to transpilePackages
```

---

## Task 1: Prisma Schema — Add UserRole, Tags, SystemConfig

**Files:**
- Modify: `packages/backend/prisma/schema.prisma`
- Modify: `packages/shared/src/types/user.ts`
- Modify: `packages/shared/src/constants/features.ts`

- [ ] **Step 1: Add UserRole enum and role field to User model in schema.prisma**

Add after the existing enums (after `PricingTierType`) and modify the `User` model:

```prisma
enum UserRole {
  SUPER_ADMIN
  ADMIN
  USER
}
```

Add to the `User` model (after `avatar` field):

```prisma
  role    UserRole @default(USER)
  tags    String[] @default([])
```

- [ ] **Step 2: Add Tag model to schema.prisma**

Add after the `User` model:

```prisma
model Tag {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("tags")
}
```

- [ ] **Step 3: Add SystemConfig model to schema.prisma**

```prisma
enum ConfigType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}

model SystemConfig {
  id          String     @id @default(cuid())
  key         String     @unique
  value       String
  type        ConfigType @default(STRING)
  group       String
  description String
  updatedBy   String?    @map("updated_by")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  @@map("system_configs")
}
```

- [ ] **Step 4: Update shared types — add role to AuthUser**

In `packages/shared/src/types/user.ts`, add `role` field:

```typescript
export interface UserProfile {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  role: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
}
```

- [ ] **Step 5: Export UserRole from shared constants**

In `packages/shared/src/constants/features.ts`, add:

```typescript
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

- [ ] **Step 6: Run Prisma migration**

```bash
cd packages/backend && npx prisma db push
```

Expected: Schema synced, new columns and tables created.

- [ ] **Step 7: Commit**

```bash
git add packages/backend/prisma/schema.prisma packages/shared/src/types/user.ts packages/shared/src/constants/features.ts
git commit -m "feat: add UserRole, Tag, SystemConfig to schema and shared types"
```

---

## Task 2: Seed SystemConfig Defaults

**Files:**
- Create: `packages/backend/prisma/seed-config.ts`
- Modify: `packages/backend/package.json` (add seed script)

- [ ] **Step 1: Create seed script**

Create `packages/backend/prisma/seed-config.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaults = [
  { key: 'free_room_limit', value: '10', type: 'NUMBER' as const, group: 'limits', description: 'Max rooms per user (free tier)' },
  { key: 'free_property_limit', value: '1', type: 'NUMBER' as const, group: 'limits', description: 'Max properties per user (free tier)' },
  { key: 'default_due_day', value: '10', type: 'NUMBER' as const, group: 'billing', description: 'Invoice due day of month' },
  { key: 'auto_generate_invoices', value: 'true', type: 'BOOLEAN' as const, group: 'billing', description: 'Auto-generate invoices on 1st of month' },
  { key: 'overdue_notification_days', value: '3', type: 'NUMBER' as const, group: 'billing', description: 'Days after due date to send notification' },
  { key: 'app_name', value: 'Room Manager', type: 'STRING' as const, group: 'app', description: 'Application display name' },
  { key: 'support_email', value: '', type: 'STRING' as const, group: 'app', description: 'Support contact email' },
  { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' as const, group: 'app', description: 'Enable maintenance mode' },
];

async function main() {
  for (const config of defaults) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      create: config,
      update: {},
    });
  }
  console.log(`Seeded ${defaults.length} system configs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed script to package.json**

In `packages/backend/package.json`, add to `"scripts"`:

```json
"seed:config": "ts-node prisma/seed-config.ts"
```

- [ ] **Step 3: Run seed**

```bash
cd packages/backend && npx ts-node prisma/seed-config.ts
```

Expected: "Seeded 8 system configs"

- [ ] **Step 4: Commit**

```bash
git add packages/backend/prisma/seed-config.ts packages/backend/package.json
git commit -m "feat: add system config seed script with defaults"
```

---

## Task 3: Backend — ConfigService

**Files:**
- Create: `packages/backend/src/admin/config/config.service.ts`
- Create: `packages/backend/src/admin/config/config.module.ts`

- [ ] **Step 1: Create ConfigService**

Create `packages/backend/src/admin/config/config.service.ts`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfigService implements OnModuleInit {
  private cache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadAll();
  }

  private async loadAll() {
    const configs = await this.prisma.systemConfig.findMany();
    this.cache.clear();
    for (const config of configs) {
      this.cache.set(config.key, config.value);
    }
  }

  get(key: string, fallback?: string): string {
    return this.cache.get(key) ?? fallback ?? '';
  }

  getNumber(key: string, fallback = 0): number {
    const val = this.cache.get(key);
    return val !== undefined ? Number(val) : fallback;
  }

  getBoolean(key: string, fallback = false): boolean {
    const val = this.cache.get(key);
    return val !== undefined ? val === 'true' : fallback;
  }

  async getAll() {
    const configs = await this.prisma.systemConfig.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    const grouped: Record<string, typeof configs> = {};
    for (const config of configs) {
      if (!grouped[config.group]) grouped[config.group] = [];
      grouped[config.group].push(config);
    }
    return grouped;
  }

  async update(updates: { key: string; value: string }[], updatedBy: string) {
    const results = [];
    for (const { key, value } of updates) {
      const updated = await this.prisma.systemConfig.update({
        where: { key },
        data: { value, updatedBy },
      });
      this.cache.set(key, value);
      results.push(updated);
    }
    return results;
  }
}
```

- [ ] **Step 2: Create ConfigModule**

Create `packages/backend/src/admin/config/config.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigService as AppConfigService } from './config.service';

@Global()
@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
```

Note: Named `AppConfigModule` to avoid conflict with NestJS built-in `ConfigModule`. The service is `ConfigService` but imported as `AppConfigService` where there's ambiguity.

- [ ] **Step 3: Write test for ConfigService**

Create `packages/backend/src/admin/config/config.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let prisma: { systemConfig: { findMany: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      systemConfig: {
        findMany: jest.fn().mockResolvedValue([
          { key: 'free_room_limit', value: '10', type: 'NUMBER', group: 'limits', description: '' },
          { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN', group: 'app', description: '' },
        ]),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ key: where.key, value: data.value }),
        ),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ConfigService);
    await service.onModuleInit();
  });

  it('should return cached string value', () => {
    expect(service.get('free_room_limit')).toBe('10');
  });

  it('should return fallback for missing key', () => {
    expect(service.get('nonexistent', 'default')).toBe('default');
  });

  it('should return number value', () => {
    expect(service.getNumber('free_room_limit')).toBe(10);
  });

  it('should return boolean value', () => {
    expect(service.getBoolean('maintenance_mode')).toBe(false);
  });

  it('should update value and refresh cache', async () => {
    await service.update([{ key: 'free_room_limit', value: '20' }], 'admin-id');
    expect(service.getNumber('free_room_limit')).toBe(20);
    expect(prisma.systemConfig.update).toHaveBeenCalledWith({
      where: { key: 'free_room_limit' },
      data: { value: '20', updatedBy: 'admin-id' },
    });
  });
});
```

- [ ] **Step 4: Run test**

```bash
cd packages/backend && npx jest src/admin/config/config.service.spec.ts --verbose
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/admin/config/
git commit -m "feat: add ConfigService with in-memory cache and DB persistence"
```

---

## Task 4: Backend — Roles Guard & Decorator

**Files:**
- Create: `packages/backend/src/admin/guards/roles.decorator.ts`
- Create: `packages/backend/src/admin/guards/roles.guard.ts`

- [ ] **Step 1: Create Roles decorator**

Create `packages/backend/src/admin/guards/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 2: Create RolesGuard**

Create `packages/backend/src/admin/guards/roles.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    return true;
  }
}
```

- [ ] **Step 3: Write test for RolesGuard**

Create `packages/backend/src/admin/guards/roles.guard.spec.ts`:

```typescript
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createContext(user: { role: string } | undefined) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it('should allow when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext({ role: 'USER' }))).toBe(true);
  });

  it('should allow when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN', 'ADMIN']);
    expect(guard.canActivate(createContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('should deny when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN', 'ADMIN']);
    expect(() => guard.canActivate(createContext({ role: 'USER' }))).toThrow(ForbiddenException);
  });

  it('should deny when no user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(ForbiddenException);
  });
});
```

- [ ] **Step 4: Run test**

```bash
cd packages/backend && npx jest src/admin/guards/roles.guard.spec.ts --verbose
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/admin/guards/
git commit -m "feat: add Roles decorator and RolesGuard for admin endpoints"
```

---

## Task 5: Backend — Update AuthGuard to Include Role

**Files:**
- Modify: `packages/backend/src/users/users.service.ts`

- [ ] **Step 1: Update upsertFromSupabase to return role**

In `packages/backend/src/users/users.service.ts`, modify the `upsertFromSupabase` method to include `role` in the return:

```typescript
  async upsertFromSupabase(supabaseUser: SupabaseUser): Promise<AuthUser> {
    const email = supabaseUser.email || null;
    const phone = supabaseUser.phone || null;
    const name = email?.split('@')[0] || phone || 'User';

    const user = await this.prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      create: { supabaseUserId: supabaseUser.id, email, phone, name },
      update: { email, phone },
    });

    return {
      id: user.id,
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    };
  }
```

No changes needed to `auth.guard.ts` — it already sets `request.user` to whatever `upsertFromSupabase` returns, which now includes `role`.

- [ ] **Step 2: Commit**

```bash
git add packages/backend/src/users/users.service.ts
git commit -m "feat: include user role in AuthUser from upsert"
```

---

## Task 6: Backend — Admin Users Service & Controller

**Files:**
- Create: `packages/backend/src/admin/users/dto/list-users.dto.ts`
- Create: `packages/backend/src/admin/users/dto/update-user.dto.ts`
- Create: `packages/backend/src/admin/users/admin-users.service.ts`
- Create: `packages/backend/src/admin/users/admin-users.controller.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/admin/users/dto/list-users.dto.ts`:

```typescript
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
```

Create `packages/backend/src/admin/users/dto/update-user.dto.ts`:

```typescript
import { IsOptional, IsString, IsIn, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'USER'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;
}

export class AssignTagsDto {
  @IsString({ each: true })
  tags: string[];
}
```

- [ ] **Step 2: Create AdminUsersService**

Create `packages/backend/src/admin/users/admin-users.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: ListUsersDto) {
    const { search, role, tag, page = 1, limit = 20 } = dto;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tags: true,
          createdAt: true,
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
            _count: { select: { rooms: true } },
          },
        },
        userFeatures: true,
        subscriptions: { orderBy: { currentPeriodEnd: 'desc' } },
        purchaseHistory: { orderBy: { purchasedAt: 'desc' } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserRole: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can promote to SUPER_ADMIN');
    }

    if (user.role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify SUPER_ADMIN');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role && { role: dto.role as any }),
      },
    });
  }

  async assignTags(userId: string, tags: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const merged = [...new Set([...user.tags, ...tags])];
    return this.prisma.user.update({
      where: { id: userId },
      data: { tags: merged },
    });
  }

  async removeTag(userId: string, tag: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { tags: user.tags.filter((t) => t !== tag) },
    });
  }
}
```

- [ ] **Step 3: Create AdminUsersController**

Create `packages/backend/src/admin/users/admin-users.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { AdminUsersService } from './admin-users.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto, AssignTagsDto } from './dto/update-user.dto';

@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @Get()
  findAll(@Query() dto: ListUsersDto) {
    return this.adminUsersService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminUsersService.update(id, dto, currentUser.role);
  }

  @Post(':id/tags')
  assignTags(@Param('id') id: string, @Body() dto: AssignTagsDto) {
    return this.adminUsersService.assignTags(id, dto.tags);
  }

  @Delete(':id/tags/:tag')
  removeTag(@Param('id') id: string, @Param('tag') tag: string) {
    return this.adminUsersService.removeTag(id, tag);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/backend/src/admin/users/
git commit -m "feat: add admin users service and controller with CRUD + tag management"
```

---

## Task 7: Backend — Admin Tags Service & Controller

**Files:**
- Create: `packages/backend/src/admin/tags/dto/create-tag.dto.ts`
- Create: `packages/backend/src/admin/tags/dto/bulk-assign-tag.dto.ts`
- Create: `packages/backend/src/admin/tags/admin-tags.service.ts`
- Create: `packages/backend/src/admin/tags/admin-tags.controller.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/admin/tags/dto/create-tag.dto.ts`:

```typescript
import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
```

Create `packages/backend/src/admin/tags/dto/bulk-assign-tag.dto.ts`:

```typescript
import { IsString } from 'class-validator';

export class BulkAssignTagDto {
  @IsString({ each: true })
  userIds: string[];
}
```

- [ ] **Step 2: Create AdminTagsService**

Create `packages/backend/src/admin/tags/admin-tags.service.ts`:

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';

@Injectable()
export class AdminTagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tags = await this.prisma.tag.findMany({ orderBy: { name: 'asc' } });

    const tagCounts = await Promise.all(
      tags.map(async (tag) => {
        const count = await this.prisma.user.count({
          where: { tags: { has: tag.name } },
        });
        return { ...tag, userCount: count };
      }),
    );

    return tagCounts;
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Tag already exists');

    return this.prisma.tag.create({ data: dto });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    if (dto.name && dto.name !== tag.name) {
      // Rename tag in all users
      const users = await this.prisma.user.findMany({ where: { tags: { has: tag.name } } });
      for (const user of users) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { tags: user.tags.map((t) => (t === tag.name ? dto.name : t)) },
        });
      }
    }

    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    // Remove tag from all users
    const users = await this.prisma.user.findMany({ where: { tags: { has: tag.name } } });
    for (const user of users) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { tags: user.tags.filter((t) => t !== tag.name) },
      });
    }

    return this.prisma.tag.delete({ where: { id } });
  }

  async bulkAssign(tagId: string, userIds: string[]) {
    const tag = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Tag not found');

    let assignedCount = 0;
    for (const userId of userIds) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && !user.tags.includes(tag.name)) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { tags: [...user.tags, tag.name] },
        });
        assignedCount++;
      }
    }

    return { assignedCount };
  }
}
```

- [ ] **Step 3: Create AdminTagsController**

Create `packages/backend/src/admin/tags/admin-tags.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminTagsService } from './admin-tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';
import { BulkAssignTagDto } from './dto/bulk-assign-tag.dto';

@Controller('admin/tags')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminTagsController {
  constructor(private adminTagsService: AdminTagsService) {}

  @Get()
  findAll() {
    return this.adminTagsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.adminTagsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.adminTagsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTagsService.remove(id);
  }

  @Post(':id/bulk-assign')
  bulkAssign(@Param('id') id: string, @Body() dto: BulkAssignTagDto) {
    return this.adminTagsService.bulkAssign(id, dto.userIds);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/backend/src/admin/tags/
git commit -m "feat: add admin tags service and controller with CRUD + bulk assign"
```

---

## Task 8: Backend — Admin Billing & Feature Grants

**Files:**
- Create: `packages/backend/src/admin/billing/dto/grant-features.dto.ts`
- Create: `packages/backend/src/admin/billing/dto/revoke-feature.dto.ts`
- Create: `packages/backend/src/admin/billing/admin-billing.service.ts`
- Create: `packages/backend/src/admin/billing/admin-billing.controller.ts`

- [ ] **Step 1: Create DTOs**

Create `packages/backend/src/admin/billing/dto/grant-features.dto.ts`:

```typescript
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GrantFeaturesDto {
  @IsString({ each: true })
  userIds: string[];

  @IsString({ each: true })
  featureKeys: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

Create `packages/backend/src/admin/billing/dto/revoke-feature.dto.ts`:

```typescript
import { IsString } from 'class-validator';

export class RevokeFeatureDto {
  @IsString()
  userId: string;

  @IsString()
  featureKey: string;
}
```

- [ ] **Step 2: Create AdminBillingService**

Create `packages/backend/src/admin/billing/admin-billing.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrantFeaturesDto } from './dto/grant-features.dto';

@Injectable()
export class AdminBillingService {
  constructor(private prisma: PrismaService) {}

  async listSubscriptions(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { currentPeriodEnd: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listPurchases(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.purchaseHistory.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { purchasedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseHistory.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async grantFeatures(dto: GrantFeaturesDto) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    let grantedCount = 0;

    for (const userId of dto.userIds) {
      for (const featureKey of dto.featureKeys) {
        await this.prisma.userFeature.upsert({
          where: { userId_featureKey: { userId, featureKey } },
          create: { userId, featureKey, expiresAt },
          update: { expiresAt },
        });
        grantedCount++;
      }
    }

    return { grantedCount };
  }

  async revokeFeature(userId: string, featureKey: string) {
    await this.prisma.userFeature.deleteMany({
      where: { userId, featureKey },
    });
    return { success: true };
  }
}
```

- [ ] **Step 3: Create AdminBillingController**

Create `packages/backend/src/admin/billing/admin-billing.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminBillingService } from './admin-billing.service';
import { GrantFeaturesDto } from './dto/grant-features.dto';
import { RevokeFeatureDto } from './dto/revoke-feature.dto';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminBillingController {
  constructor(private adminBillingService: AdminBillingService) {}

  @Get('subscriptions')
  listSubscriptions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminBillingService.listSubscriptions(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('purchases')
  listPurchases(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminBillingService.listPurchases(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('features/grant')
  grantFeatures(@Body() dto: GrantFeaturesDto) {
    return this.adminBillingService.grantFeatures(dto);
  }

  @Delete('features/revoke')
  revokeFeature(@Body() dto: RevokeFeatureDto) {
    return this.adminBillingService.revokeFeature(dto.userId, dto.featureKey);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/backend/src/admin/billing/
git commit -m "feat: add admin billing controller with subscriptions, purchases, feature grants"
```

---

## Task 9: Backend — Admin Config Controller

**Files:**
- Create: `packages/backend/src/admin/config/dto/update-config.dto.ts`
- Create: `packages/backend/src/admin/config/admin-config.controller.ts`

- [ ] **Step 1: Create DTO**

Create `packages/backend/src/admin/config/dto/update-config.dto.ts`:

```typescript
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfigUpdateItemDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class UpdateConfigDto {
  @Type(() => ConfigUpdateItemDto)
  configs: ConfigUpdateItemDto[];
}
```

- [ ] **Step 2: Create AdminConfigController**

Create `packages/backend/src/admin/config/admin-config.controller.ts`:

```typescript
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('admin/config')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateConfigDto) {
    return this.configService.update(dto.configs, user.id);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/backend/src/admin/config/dto/ packages/backend/src/admin/config/admin-config.controller.ts
git commit -m "feat: add admin config controller for system settings (SUPER_ADMIN only)"
```

---

## Task 10: Backend — AdminModule & Wire Up

**Files:**
- Create: `packages/backend/src/admin/admin.module.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Create AdminModule**

Create `packages/backend/src/admin/admin.module.ts`:

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from './guards/roles.guard';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminTagsController } from './tags/admin-tags.controller';
import { AdminTagsService } from './tags/admin-tags.service';
import { AdminBillingController } from './billing/admin-billing.controller';
import { AdminBillingService } from './billing/admin-billing.service';
import { AdminConfigController } from './config/admin-config.controller';
import { ConfigService } from './config/config.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [
    AdminUsersController,
    AdminTagsController,
    AdminBillingController,
    AdminConfigController,
  ],
  providers: [
    RolesGuard,
    AdminUsersService,
    AdminTagsService,
    AdminBillingService,
    ConfigService,
  ],
  exports: [ConfigService],
})
export class AdminModule {}
```

- [ ] **Step 2: Add AdminModule to AppModule**

In `packages/backend/src/app.module.ts`, add import:

```typescript
import { AdminModule } from './admin/admin.module';
```

Add `AdminModule` to the `imports` array.

- [ ] **Step 3: Verify backend compiles**

```bash
cd packages/backend && npx nest build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Run all tests**

```bash
cd packages/backend && npx jest --passWithNoTests --verbose
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/backend/src/admin/admin.module.ts packages/backend/src/app.module.ts
git commit -m "feat: wire up AdminModule in AppModule"
```

---

## Task 11: Frontend — Routing Restructure

**Files:**
- Modify: `packages/frontend/src/app/layout.tsx`
- Create: `packages/frontend/src/app/(app)/layout.tsx`
- Move: `packages/frontend/src/app/(auth)/*` → `packages/frontend/src/app/(app)/(auth)/*`
- Move: `packages/frontend/src/app/(dashboard)/*` → `packages/frontend/src/app/(app)/(dashboard)/*`

- [ ] **Step 1: Update root layout — strip mobile wrapper**

Replace `packages/frontend/src/app/layout.tsx` content with:

```tsx
import { Providers } from "@/components/providers";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Room Manager",
  description: "Quản lý phòng trọ dễ dàng",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create (app) layout with mobile wrapper**

Create `packages/frontend/src/app/(app)/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Room Manager",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-200 overflow-hidden">
      <div
        id="app-root"
        className="relative mx-auto min-h-dvh w-full max-w-md bg-white shadow-[0_0_60px_rgba(0,0,0,0.12)]"
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Move (auth) and (dashboard) into (app)**

```bash
cd packages/frontend/src/app

# Create (app) directory
mkdir -p "(app)"

# Move auth and dashboard route groups
mv "(auth)" "(app)/(auth)"
mv "(dashboard)" "(app)/(dashboard)"
```

- [ ] **Step 4: Move onboarding if it exists at top level**

```bash
cd packages/frontend/src/app
# Check and move if exists
[ -d "onboarding" ] && mv "onboarding" "(app)/onboarding"
```

- [ ] **Step 5: Update root page.tsx redirect**

Verify `packages/frontend/src/app/page.tsx` still redirects to `/dashboard`. Since the `(app)` route group doesn't affect URL paths, `/dashboard` still resolves to `(app)/(dashboard)/dashboard/page.tsx`. No changes needed.

- [ ] **Step 6: Verify dev server starts**

```bash
cd packages/frontend && npm run dev
```

Navigate to `http://localhost:3000/dashboard` — should render the mobile app as before.

- [ ] **Step 7: Commit**

```bash
cd packages/frontend
git add src/app/layout.tsx src/app/"(app)"/ 
git add -A src/app/"(auth)"/ src/app/"(dashboard)"/
git commit -m "refactor: restructure routes — move mobile app into (app) route group"
```

---

## Task 12: Frontend — Update Middleware for Admin Routes

**Files:**
- Modify: `packages/frontend/src/lib/supabase/middleware.ts`

- [ ] **Step 1: Update middleware to handle admin routes**

Replace `packages/frontend/src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminLogin = pathname === '/admin-login';
  const isAdminPage = pathname.startsWith('/admin');

  // Admin routes: allow /admin-login without auth, require auth for /admin/*
  if (isAdminPage && !isAdminLogin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      return NextResponse.redirect(url);
    }
    // Role check happens client-side and via API guards
    return response;
  }

  // Admin login: if already logged in, go to admin
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // App routes: existing logic
  if (!user && !isAuthPage && !isAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/lib/supabase/middleware.ts
git commit -m "feat: update middleware to handle admin routes and admin-login"
```

---

## Task 13: Frontend — Admin Layout with Antd

**Files:**
- Modify: `packages/frontend/package.json` — move antd to dependencies
- Modify: `packages/frontend/next.config.ts` — add antd to transpilePackages
- Create: `packages/frontend/src/app/(admin)/layout.tsx`
- Create: `packages/frontend/src/components/admin/admin-sidebar.tsx`
- Create: `packages/frontend/src/hooks/use-admin-auth.ts`

- [ ] **Step 1: Move antd to dependencies**

In `packages/frontend/package.json`, move `"antd"` from `devDependencies` to `dependencies`:

```json
{
  "dependencies": {
    "antd": "^6.3.6",
    ...
  }
}
```

Remove the `"antd": "^6.3.6"` line from `devDependencies`.

- [ ] **Step 2: Add antd to transpilePackages**

In `packages/frontend/next.config.ts`, add `'antd'` to `transpilePackages`:

```typescript
const nextConfig: NextConfig = {
  transpilePackages: ['@room-manager/shared', 'antd-mobile', 'antd', '@ant-design/icons'],
  ...
};
```

- [ ] **Step 3: Create admin auth hook**

Create `packages/frontend/src/hooks/use-admin-auth.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { type AuthUser } from '@room-manager/shared';

export function useAdminAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<AuthUser>('/auth/me')
      .then((data) => {
        if (data.role !== 'SUPER_ADMIN' && data.role !== 'ADMIN') {
          router.replace('/admin-login');
          return;
        }
        setUser(data);
      })
      .catch(() => {
        router.replace('/admin-login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}
```

- [ ] **Step 4: Create admin sidebar component**

Create `packages/frontend/src/components/admin/admin-sidebar.tsx`:

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TagsOutlined,
  DollarOutlined,
  SettingOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/admin/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/admin/tags', icon: <TagsOutlined />, label: 'Tags' },
  { key: '/admin/billing', icon: <DollarOutlined />, label: 'Billing' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export function AdminSidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = menuItems
    .filter((item) => pathname.startsWith(item.key))
    .sort((a, b) => b.key.length - a.key.length)[0]?.key || '/admin';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      style={{ minHeight: '100vh' }}
      theme="light"
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: collapsed ? 16 : 18 }}>
        {collapsed ? '🏠' : '🏠 Admin'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
}
```

- [ ] **Step 5: Create admin layout**

Create `packages/frontend/src/app/(admin)/layout.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Layout, Spin, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const { Header, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ConfigProvider locale={viVN}>
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
        <Layout>
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Room Manager Admin</span>
            <span style={{ color: '#888' }}>{user.email} ({user.role})</span>
          </Header>
          <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/frontend/package.json packages/frontend/next.config.ts packages/frontend/src/app/"(admin)"/layout.tsx packages/frontend/src/components/admin/admin-sidebar.tsx packages/frontend/src/hooks/use-admin-auth.ts
git commit -m "feat: add admin layout with Antd Sider, Header, and role-gated auth"
```

---

## Task 14: Frontend — Admin Login Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/(auth)/admin-login/page.tsx`

- [ ] **Step 1: Create admin login page**

Create `packages/frontend/src/app/(admin)/(auth)/admin-login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api';
import { type AuthUser } from '@room-manager/shared';

const { Title, Text } = Typography;

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error('Email hoặc mật khẩu không đúng');
        return;
      }

      // Verify admin role
      const user = await apiFetch<AuthUser>('/auth/me');
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        await supabase.auth.signOut();
        message.error('Tài khoản không có quyền admin');
        return;
      }

      router.replace('/admin');
    } catch {
      message.error('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏠</div>
          <Title level={3} style={{ margin: 0 }}>Admin Panel</Title>
          <Text type="secondary">Room Manager Administration</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined />} placeholder="admin@example.com" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Ensure admin-login is NOT wrapped by admin layout**

The `(auth)` route group inside `(admin)` needs its own layout that skips the admin sidebar. Create `packages/frontend/src/app/(admin)/(auth)/layout.tsx`:

```tsx
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

This overrides the parent `(admin)/layout.tsx` for auth pages so they render without the sidebar/header.

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/"(auth)"/
git commit -m "feat: add admin login page with Antd form and role verification"
```

---

## Task 15: Frontend — Admin Dashboard Placeholder

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Create placeholder dashboard**

Create `packages/frontend/src/app/(admin)/admin/page.tsx`:

```tsx
'use client';

import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, HomeOutlined, DollarOutlined, TagsOutlined } from '@ant-design/icons';

export default function AdminDashboard() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Users" value="—" prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Properties" value="—" prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Revenue" value="—" prefix={<DollarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Tags" value="—" prefix={<TagsOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <p style={{ color: '#888' }}>Dashboard chi tiết sẽ được bổ sung trong Phase 2.</p>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/page.tsx
git commit -m "feat: add admin dashboard placeholder page"
```

---

## Task 16: Frontend — Admin Users List Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/users/page.tsx`

- [ ] **Step 1: Create users list page**

Create `packages/frontend/src/app/(admin)/admin/users/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Table, Tag, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface UserItem {
  id: string;
  email: string | null;
  name: string;
  role: string;
  tags: string[];
  createdAt: string;
  _count: { properties: number };
}

interface UsersResponse {
  items: UserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  USER: 'default',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      return apiFetch<UsersResponse>(`/admin/users?${params}`);
    },
  });

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || '—',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role]}>{role}</Tag>,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags.map((t) => <Tag key={t}>{t}</Tag>),
    },
    {
      title: 'Properties',
      key: 'properties',
      render: (_: unknown, record: UserItem) => record._count.properties,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => new Date(d).toLocaleDateString('vi-VN'),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: UserItem) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/users/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý Users</h2>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm email hoặc tên..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          allowClear
          style={{ width: 250 }}
        />
        <Select
          placeholder="Lọc role"
          allowClear
          style={{ width: 150 }}
          value={roleFilter}
          onChange={(v) => { setRoleFilter(v); setPage(1); }}
          options={[
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'USER', label: 'User' },
          ]}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data?.items}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: data?.page,
          total: data?.total,
          pageSize: data?.limit,
          onChange: setPage,
          showTotal: (total) => `Tổng ${total} users`,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/users/page.tsx
git commit -m "feat: add admin users list page with search, role filter, pagination"
```

---

## Task 17: Frontend — Admin User Detail Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/users/[id]/page.tsx`

- [ ] **Step 1: Create user detail page**

Create `packages/frontend/src/app/(admin)/admin/users/[id]/page.tsx`:

```tsx
'use client';

import { use } from 'react';
import { Card, Descriptions, Tag, Select, Button, Table, Space, message, Popconfirm, Input } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';
import { useState } from 'react';

interface UserDetail {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  tags: string[];
  createdAt: string;
  properties: { id: string; name: string; address: string | null; _count: { rooms: number } }[];
  userFeatures: { id: string; featureKey: string; expiresAt: string | null }[];
  subscriptions: { id: string; plan: string; status: string; currentPeriodEnd: string }[];
  purchaseHistory: { id: string; featureKey: string; amountPaid: number; purchasedAt: string; status: string }[];
}

const allFeatureKeys = Object.values(FEATURE_KEYS);

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [newTag, setNewTag] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => apiFetch<UserDetail>(`/admin/users/${id}`),
  });

  const updateRole = useMutation({
    mutationFn: (role: string) => apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-user', id] }); message.success('Đã cập nhật role'); },
    onError: (e: Error) => message.error(e.message),
  });

  const addTag = useMutation({
    mutationFn: (tags: string[]) => apiFetch(`/admin/users/${id}/tags`, { method: 'POST', body: JSON.stringify({ tags }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-user', id] }); setNewTag(''); },
  });

  const removeTag = useMutation({
    mutationFn: (tag: string) => apiFetch(`/admin/users/${id}/tags/${tag}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-user', id] }),
  });

  const grantFeature = useMutation({
    mutationFn: (featureKey: string) => apiFetch('/admin/features/grant', { method: 'POST', body: JSON.stringify({ userIds: [id], featureKeys: [featureKey] }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-user', id] }); message.success('Đã cấp feature'); },
  });

  const revokeFeature = useMutation({
    mutationFn: (featureKey: string) => apiFetch('/admin/features/revoke', { method: 'DELETE', body: JSON.stringify({ userId: id, featureKey }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-user', id] }); message.success('Đã thu hồi feature'); },
  });

  if (isLoading || !user) return null;

  const activeFeatureKeys = user.userFeatures.map((f) => f.featureKey);
  const availableFeatures = allFeatureKeys.filter((k) => !activeFeatureKeys.includes(k));

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => router.push('/admin/users')} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>

      <Card title="Thông tin user" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{user.email || '—'}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Created">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Select value={user.role} onChange={(v) => updateRole.mutate(v)} style={{ width: 150 }}
              options={[
                { value: 'SUPER_ADMIN', label: 'Super Admin' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'USER', label: 'User' },
              ]}
            />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Tags" style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 12 }}>
          {user.tags.map((tag) => (
            <Tag key={tag} closable onClose={() => removeTag.mutate(tag)}>{tag}</Tag>
          ))}
        </Space>
        <Space.Compact>
          <Input placeholder="Thêm tag..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onPressEnter={() => newTag && addTag.mutate([newTag])} />
          <Button type="primary" onClick={() => newTag && addTag.mutate([newTag])}>Thêm</Button>
        </Space.Compact>
      </Card>

      <Card title="Properties" style={{ marginBottom: 16 }}>
        <Table
          dataSource={user.properties}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Tên', dataIndex: 'name' },
            { title: 'Địa chỉ', dataIndex: 'address', render: (v: string | null) => v || '—' },
            { title: 'Phòng', render: (_: unknown, r: any) => r._count.rooms },
          ]}
        />
      </Card>

      <Card title="Features" style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 12 }}>
          <Select placeholder="Cấp feature..." style={{ width: 200 }} value={undefined}
            onChange={(v) => grantFeature.mutate(v)}
            options={availableFeatures.map((k) => ({ value: k, label: k }))}
          />
        </Space>
        <Table
          dataSource={user.userFeatures}
          rowKey="id"
          pagination={false}
          columns={[
            { title: 'Feature', dataIndex: 'featureKey' },
            { title: 'Expires', dataIndex: 'expiresAt', render: (v: string | null) => v ? new Date(v).toLocaleDateString('vi-VN') : 'Vĩnh viễn' },
            { title: '', render: (_: unknown, r: any) => (
              <Popconfirm title="Thu hồi feature này?" onConfirm={() => revokeFeature.mutate(r.featureKey)}>
                <Button danger icon={<DeleteOutlined />} size="small">Thu hồi</Button>
              </Popconfirm>
            )},
          ]}
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/users/"[id]"/page.tsx
git commit -m "feat: add admin user detail page with role, tags, features management"
```

---

## Task 18: Frontend — Admin Tags Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/tags/page.tsx`

- [ ] **Step 1: Create tags management page**

Create `packages/frontend/src/app/(admin)/admin/tags/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, ColorPicker, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface TagItem {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  userCount: number;
}

export default function AdminTagsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [form] = Form.useForm();

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () => apiFetch<TagItem[]>('/admin/tags'),
  });

  const createTag = useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      apiFetch('/admin/tags', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); closeModal(); message.success('Đã tạo tag'); },
    onError: (e: Error) => message.error(e.message),
  });

  const updateTag = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; color?: string }) =>
      apiFetch(`/admin/tags/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); closeModal(); message.success('Đã cập nhật tag'); },
  });

  const deleteTag = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/tags/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tags'] }); message.success('Đã xoá tag'); },
  });

  const closeModal = () => { setModalOpen(false); setEditingTag(null); form.resetFields(); };

  const openCreate = () => { setEditingTag(null); form.resetFields(); setModalOpen(true); };

  const openEdit = (tag: TagItem) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name, description: tag.description, color: tag.color });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const color = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || undefined;
      const data = { ...values, color };
      if (editingTag) {
        updateTag.mutate({ id: editingTag.id, ...data });
      } else {
        createTag.mutate(data);
      }
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Quản lý Tags</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo Tag</Button>
      </div>

      <Table
        dataSource={tags}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        columns={[
          {
            title: 'Tag',
            key: 'tag',
            render: (_: unknown, r: TagItem) => <Tag color={r.color || undefined}>{r.name}</Tag>,
          },
          { title: 'Mô tả', dataIndex: 'description', render: (v: string | null) => v || '—' },
          { title: 'Users', dataIndex: 'userCount', sorter: (a: TagItem, b: TagItem) => a.userCount - b.userCount },
          {
            title: '',
            key: 'actions',
            render: (_: unknown, r: TagItem) => (
              <Space>
                <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)}>Sửa</Button>
                <Popconfirm title={`Xoá tag "${r.name}"? Sẽ gỡ khỏi tất cả users.`} onConfirm={() => deleteTag.mutate(r.id)}>
                  <Button danger icon={<DeleteOutlined />} size="small">Xoá</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingTag ? 'Sửa Tag' : 'Tạo Tag'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={closeModal}
        confirmLoading={createTag.isPending || updateTag.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên tag' }]}>
            <Input placeholder="early_adopter" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input placeholder="100 user đầu tiên" />
          </Form.Item>
          <Form.Item name="color" label="Màu">
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/tags/page.tsx
git commit -m "feat: add admin tags management page with CRUD and color picker"
```

---

## Task 19: Frontend — Admin Billing Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/billing/page.tsx`

- [ ] **Step 1: Create billing management page**

Create `packages/frontend/src/app/(admin)/admin/billing/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Tabs, Table, Tag, Button, Modal, Form, Select, DatePicker, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';

const allFeatureKeys = Object.values(FEATURE_KEYS);

interface SubscriptionItem {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  user: { id: string; email: string | null; name: string };
}

interface PurchaseItem {
  id: string;
  featureKey: string;
  amountPaid: number;
  purchasedAt: string;
  status: string;
  user: { id: string; email: string | null; name: string };
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export default function AdminBillingPage() {
  const qc = useQueryClient();
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantForm] = Form.useForm();
  const [subPage, setSubPage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);

  const { data: users } = useQuery({
    queryKey: ['admin-users-select'],
    queryFn: () => apiFetch<{ items: { id: string; email: string | null; name: string }[] }>('/admin/users?limit=100'),
  });

  const { data: subs, isLoading: subsLoading } = useQuery({
    queryKey: ['admin-subs', subPage],
    queryFn: () => apiFetch<PaginatedResponse<SubscriptionItem>>(`/admin/subscriptions?page=${subPage}`),
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ['admin-purchases', purchasePage],
    queryFn: () => apiFetch<PaginatedResponse<PurchaseItem>>(`/admin/purchases?page=${purchasePage}`),
  });

  const grantFeatures = useMutation({
    mutationFn: (data: { userIds: string[]; featureKeys: string[]; expiresAt?: string }) =>
      apiFetch('/admin/features/grant', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (result: any) => {
      qc.invalidateQueries({ queryKey: ['admin-'] });
      setGrantModalOpen(false);
      grantForm.resetFields();
      message.success(`Đã cấp ${result.grantedCount} features`);
    },
  });

  const statusColors: Record<string, string> = { ACTIVE: 'green', CANCELLED: 'red', EXPIRED: 'default' };

  const tabItems = [
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      children: (
        <Table
          dataSource={subs?.items}
          rowKey="id"
          loading={subsLoading}
          pagination={{ current: subPage, total: subs?.total, onChange: setSubPage }}
          columns={[
            { title: 'User', render: (_: unknown, r: SubscriptionItem) => r.user.email || r.user.name },
            { title: 'Plan', dataIndex: 'plan' },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
            { title: 'Hết hạn', dataIndex: 'currentPeriodEnd', render: (d: string) => new Date(d).toLocaleDateString('vi-VN') },
          ]}
        />
      ),
    },
    {
      key: 'purchases',
      label: 'Purchase History',
      children: (
        <Table
          dataSource={purchases?.items}
          rowKey="id"
          loading={purchasesLoading}
          pagination={{ current: purchasePage, total: purchases?.total, onChange: setPurchasePage }}
          columns={[
            { title: 'User', render: (_: unknown, r: PurchaseItem) => r.user.email || r.user.name },
            { title: 'Feature', dataIndex: 'featureKey' },
            { title: 'Amount', dataIndex: 'amountPaid', render: (v: number) => `${v.toLocaleString('vi-VN')}đ` },
            { title: 'Date', dataIndex: 'purchasedAt', render: (d: string) => new Date(d).toLocaleDateString('vi-VN') },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Billing & Features</h2>
        <Button type="primary" onClick={() => setGrantModalOpen(true)}>Cấp Feature</Button>
      </div>

      <Tabs items={tabItems} />

      <Modal
        title="Cấp Feature cho Users"
        open={grantModalOpen}
        onCancel={() => { setGrantModalOpen(false); grantForm.resetFields(); }}
        onOk={() => grantForm.validateFields().then((v) => {
          grantFeatures.mutate({
            userIds: v.userIds,
            featureKeys: v.featureKeys,
            expiresAt: v.expiresAt?.toISOString(),
          });
        })}
        confirmLoading={grantFeatures.isPending}
      >
        <Form form={grantForm} layout="vertical">
          <Form.Item name="userIds" label="Users" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              placeholder="Chọn users..."
              options={users?.items.map((u) => ({ value: u.id, label: u.email || u.name }))}
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="featureKeys" label="Features" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Chọn features..." options={allFeatureKeys.map((k) => ({ value: k, label: k }))} />
          </Form.Item>
          <Form.Item name="expiresAt" label="Hết hạn (để trống = vĩnh viễn)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/billing/page.tsx
git commit -m "feat: add admin billing page with subscriptions, purchases, feature grants"
```

---

## Task 20: Frontend — Admin System Config Page

**Files:**
- Create: `packages/frontend/src/app/(admin)/admin/settings/page.tsx`

- [ ] **Step 1: Create system config page**

Create `packages/frontend/src/app/(admin)/admin/settings/page.tsx`:

```tsx
'use client';

import { Card, Form, Input, InputNumber, Switch, Button, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  group: string;
  description: string;
}

type GroupedConfigs = Record<string, ConfigItem[]>;

const groupLabels: Record<string, string> = {
  limits: 'Giới hạn',
  billing: 'Thanh toán',
  app: 'Ứng dụng',
};

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => apiFetch<GroupedConfigs>('/admin/config'),
  });

  const updateConfig = useMutation({
    mutationFn: (updates: { key: string; value: string }[]) =>
      apiFetch('/admin/config', { method: 'PATCH', body: JSON.stringify({ configs: updates }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-config'] }); message.success('Đã lưu cấu hình'); },
    onError: (e: Error) => message.error(e.message),
  });

  const handleSaveGroup = (group: string) => {
    const items = configs?.[group];
    if (!items) return;

    const form = document.getElementById(`form-${group}`) as HTMLFormElement;
    const formData = new FormData(form);

    const updates = items.map((item) => {
      let value: string;
      if (item.type === 'BOOLEAN') {
        const checkbox = form.querySelector(`[name="${item.key}"]`) as HTMLInputElement;
        value = checkbox?.checked ? 'true' : 'false';
      } else {
        value = (formData.get(item.key) as string) ?? item.value;
      }
      return { key: item.key, value };
    });

    updateConfig.mutate(updates);
  };

  if (isLoading) return <Spin />;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Cấu hình hệ thống</h2>

      {configs && Object.entries(configs).map(([group, items]) => (
        <Card
          key={group}
          title={groupLabels[group] || group}
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSaveGroup(group)}
              loading={updateConfig.isPending}
            >
              Lưu
            </Button>
          }
        >
          <form id={`form-${group}`}>
            {items.map((item) => (
              <div key={item.key} style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, display: 'block', marginBottom: 4 }}>{item.key}</label>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{item.description}</p>
                {item.type === 'BOOLEAN' ? (
                  <Switch name={item.key} defaultChecked={item.value === 'true'} />
                ) : item.type === 'NUMBER' ? (
                  <InputNumber name={item.key} defaultValue={Number(item.value)} style={{ width: 200 }} />
                ) : (
                  <Input name={item.key} defaultValue={item.value} style={{ maxWidth: 400 }} />
                )}
              </div>
            ))}
          </form>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/frontend/src/app/"(admin)"/admin/settings/page.tsx
git commit -m "feat: add admin system config page with grouped settings and inline editing"
```

---

## Task 21: Backend — Replace env var usage with ConfigService

**Files:**
- Modify: `packages/backend/src/rooms/rooms.service.ts`

- [ ] **Step 1: Inject ConfigService and use it for room limit**

In `packages/backend/src/rooms/rooms.service.ts`:

Add import and inject:

```typescript
import { ConfigService } from '../admin/config/config.service';
```

Modify constructor:

```typescript
constructor(
  private prisma: PrismaService,
  private configService: ConfigService,
) {}
```

Modify `getRoomLimit`:

```typescript
private async getRoomLimit(userId: string): Promise<number> {
  const features = await this.prisma.userFeature.findMany({
    where: { userId },
    select: { featureKey: true },
  });
  const featureKeys = features.map((f) => f.featureKey);
  if (featureKeys.includes(FEATURE_KEYS.ROOMS_50)) return ROOMS_50_LIMIT;
  const slotCount = featureKeys.filter((k) => k === FEATURE_KEYS.ROOMS_SLOT).length;
  const freeLimit = this.configService.getNumber('free_room_limit', FREE_ROOM_LIMIT);
  return freeLimit + slotCount * SLOT_SIZE;
}
```

Modify `create` method — remove `process.env.PREMIUM_ENABLED` check, use only feature-based limits:

```typescript
if (totalRooms >= limit) {
  throw new ForbiddenException(`Đã đạt giới hạn ${limit} phòng. Mua thêm slot để mở rộng.`);
}
```

The PREMIUM_ENABLED bypass is no longer needed — admin can grant features directly via the admin panel.

- [ ] **Step 2: Update RoomsModule to import ConfigService dependencies**

Since `ConfigService` is provided by `AdminModule` and exported, and `AppConfigModule` is `@Global()`, no additional imports needed in `RoomsModule`. If the build fails because `ConfigService` is not found, add `AppConfigModule` import to `RoomsModule`:

Check `packages/backend/src/admin/admin.module.ts` — the `ConfigService` is currently only in `AdminModule`. We need to make it globally available. Update `admin.module.ts`:

In Task 10, `AdminModule` already exports `ConfigService`. But for global access, update `admin/config/config.module.ts` to be `@Global()` (already done in Task 3). Ensure `AppConfigModule` is imported in `AppModule` separately, or that `AdminModule` re-exports it correctly.

Actually, simplest approach: import `AppConfigModule` in `AppModule` directly (it's already `@Global()`). In `packages/backend/src/app.module.ts`, add:

```typescript
import { AppConfigModule } from './admin/config/config.module';
```

And add `AppConfigModule` to imports (before `AdminModule`).

- [ ] **Step 3: Verify build**

```bash
cd packages/backend && npx nest build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/backend/src/rooms/rooms.service.ts packages/backend/src/app.module.ts
git commit -m "refactor: replace PREMIUM_ENABLED env var with ConfigService for room limits"
```

---

## Task 22: Set First User as SUPER_ADMIN

**Files:**
- Create: `packages/backend/prisma/set-admin.ts`

- [ ] **Step 1: Create script to promote user to SUPER_ADMIN**

Create `packages/backend/prisma/set-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node prisma/set-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' },
  });

  console.log(`User ${email} promoted to SUPER_ADMIN`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add script to package.json**

In `packages/backend/package.json`, add to `"scripts"`:

```json
"set-admin": "ts-node prisma/set-admin.ts"
```

- [ ] **Step 3: Run to promote your account**

```bash
cd packages/backend && npx ts-node prisma/set-admin.ts ittmchien@gmail.com
```

Expected: "User ittmchien@gmail.com promoted to SUPER_ADMIN"

- [ ] **Step 4: Commit**

```bash
git add packages/backend/prisma/set-admin.ts packages/backend/package.json
git commit -m "feat: add set-admin script to promote user to SUPER_ADMIN"
```

---

## Task 23: End-to-End Verification

- [ ] **Step 1: Start backend**

```bash
cd packages/backend && npm run start:dev
```

Verify: no startup errors, ConfigService loads system_configs.

- [ ] **Step 2: Start frontend**

```bash
cd packages/frontend && npm run dev
```

- [ ] **Step 3: Verify mobile app still works**

Navigate to `http://localhost:3000/dashboard` — should render mobile layout as before with no regressions.

- [ ] **Step 4: Test admin login**

Navigate to `http://localhost:3000/admin-login` — should show Antd login form. Login with admin credentials.

- [ ] **Step 5: Test admin panel**

After login, verify:
- Admin dashboard loads at `/admin`
- Users list loads at `/admin/users` with table
- User detail shows role selector, tags, features
- Tags page allows create/edit/delete
- Billing page shows subscriptions/purchases tabs and grant modal
- Settings page shows grouped config with save buttons

- [ ] **Step 6: Test API role guard**

Try accessing `/admin/users` API without admin role — should return 403.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: end-to-end verification fixes for admin panel"
```
