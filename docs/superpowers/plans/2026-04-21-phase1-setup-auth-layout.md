# Phase 1: Project Setup, Database, Auth & Core Layout

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Room Manager monorepo with working auth (Google, Phone OTP, Email) and core app layout (mobile bottom nav + desktop sidebar).

**Architecture:** pnpm monorepo with 3 packages — `frontend` (Next.js 16 App Router), `backend` (NestJS 11 + Prisma), `shared` (TypeScript types/constants). Supabase provides Auth + PostgreSQL hosting. NestJS verifies Supabase JWT tokens via guard.

**Tech Stack:** Next.js 16, NestJS 11, Prisma, Supabase (Auth + PostgreSQL), TailwindCSS, Shadcn/Radix UI, pnpm workspaces

**Phases overview:** This is Phase 1 of 6. Subsequent phases will add CRUD, billing, monetization, premium features, notifications, and PWA.

---

## File Structure

```
room-manager/
├── package.json                          # Root workspace config
├── pnpm-workspace.yaml                   # pnpm workspace definition
├── .gitignore
├── .nvmrc                                # Node 22
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts                  # Re-export all
│   │       ├── types/
│   │       │   ├── user.ts               # User types
│   │       │   └── index.ts
│   │       └── constants/
│   │           ├── features.ts           # Feature keys enum
│   │           └── index.ts
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   ├── prisma/
│   │   │   └── schema.prisma            # Full database schema
│   │   ├── src/
│   │   │   ├── main.ts                  # NestJS bootstrap
│   │   │   ├── app.module.ts            # Root module
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.guard.ts        # Supabase JWT guard
│   │   │   │   ├── auth.service.ts      # Token verification
│   │   │   │   ├── auth.controller.ts   # GET /auth/me
│   │   │   │   ├── decorators/
│   │   │   │   │   └── current-user.decorator.ts
│   │   │   │   └── __tests__/
│   │   │   │       ├── auth.guard.spec.ts
│   │   │   │       └── auth.service.spec.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.service.ts     # Upsert user on first login
│   │   │   │   ├── users.controller.ts  # GET/PATCH profile
│   │   │   │   └── __tests__/
│   │   │   │       └── users.service.spec.ts
│   │   │   └── prisma/
│   │   │       ├── prisma.module.ts
│   │   │       └── prisma.service.ts
│   │   └── test/
│   │       └── jest-e2e.json
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       ├── components.json               # Shadcn config
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx            # Root layout + providers
│       │   │   ├── page.tsx              # Redirect to /dashboard or /login
│       │   │   ├── (auth)/
│       │   │   │   ├── layout.tsx        # Auth layout (centered, no nav)
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx      # Login page
│       │   │   │   ├── register/
│       │   │   │   │   └── page.tsx      # Register page
│       │   │   │   └── onboarding/
│       │   │   │       └── page.tsx      # Onboarding wizard
│       │   │   └── (dashboard)/
│       │   │       ├── layout.tsx        # Dashboard layout (sidebar + bottom nav)
│       │   │       └── dashboard/
│       │   │           └── page.tsx      # Dashboard page (placeholder)
│       │   ├── components/
│       │   │   ├── ui/                   # Shadcn components (auto-generated)
│       │   │   ├── layout/
│       │   │   │   ├── sidebar.tsx       # Desktop sidebar nav
│       │   │   │   ├── bottom-nav.tsx    # Mobile bottom navigation
│       │   │   │   └── top-bar.tsx       # Mobile top bar
│       │   │   └── auth/
│       │   │       ├── login-form.tsx
│       │   │       ├── register-form.tsx
│       │   │       └── onboarding-wizard.tsx
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts         # Browser Supabase client
│       │   │   │   ├── server.ts         # Server Supabase client
│       │   │   │   └── middleware.ts     # Auth middleware helper
│       │   │   └── api.ts               # Backend API client (fetch wrapper)
│       │   ├── hooks/
│       │   │   └── use-auth.ts          # Auth state hook
│       │   └── stores/
│       │       └── auth-store.ts        # Zustand auth store
│       └── middleware.ts                 # Next.js middleware (auth redirect)
```

---

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: Init git repo**

```bash
cd /Users/comchientrung/company/room-manager
git init
```

- [ ] **Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "room-manager",
  "private": true,
  "scripts": {
    "dev:be": "pnpm --filter @room-manager/backend dev",
    "dev:fe": "pnpm --filter @room-manager/frontend dev",
    "build:be": "pnpm --filter @room-manager/backend build",
    "build:fe": "pnpm --filter @room-manager/frontend build",
    "build:shared": "pnpm --filter @room-manager/shared build",
    "db:generate": "pnpm --filter @room-manager/backend db:generate",
    "db:push": "pnpm --filter @room-manager/backend db:push",
    "db:migrate": "pnpm --filter @room-manager/backend db:migrate",
    "db:studio": "pnpm --filter @room-manager/backend db:studio",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  },
  "engines": {
    "node": ">=22"
  }
}
```

- [ ] **Step 3: Create pnpm-workspace.yaml**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
```

- [ ] **Step 4: Create .nvmrc**

Create `.nvmrc`:
```
22
```

- [ ] **Step 5: Create .gitignore**

Create `.gitignore`:
```
node_modules/
dist/
.next/
.env
.env.local
.env.*.local
*.log
.turbo
coverage/
.DS_Store
```

- [ ] **Step 6: Verify and commit**

```bash
pnpm -v  # Verify pnpm is installed
git add -A
git commit -m "chore: initialize monorepo with pnpm workspace"
```

---

### Task 2: Setup Shared Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/user.ts`
- Create: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/constants/features.ts`
- Create: `packages/shared/src/constants/index.ts`

- [ ] **Step 1: Create package.json**

Create `packages/shared/package.json`:
```json
{
  "name": "@room-manager/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create types**

Create `packages/shared/src/types/user.ts`:
```typescript
export interface UserProfile {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  supabaseUserId: string;
  email: string | null;
  phone: string | null;
  name: string;
}
```

Create `packages/shared/src/types/index.ts`:
```typescript
export * from './user';
```

- [ ] **Step 4: Create constants**

Create `packages/shared/src/constants/features.ts`:
```typescript
export const FEATURE_KEYS = {
  ROOMS_SLOT: 'rooms_slot',
  ROOMS_50: 'rooms_50',
  MULTI_PROPERTY: 'multi_property',
  CONTRACTS: 'contracts',
  FINANCIAL_REPORTS: 'financial_reports',
  EXPENSES: 'expenses',
  REMOVE_ADS: 'remove_ads',
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export const FREE_ROOM_LIMIT = 10;
export const FREE_PROPERTY_LIMIT = 1;
```

Create `packages/shared/src/constants/index.ts`:
```typescript
export * from './features';
```

- [ ] **Step 5: Create index**

Create `packages/shared/src/index.ts`:
```typescript
export * from './types';
export * from './constants';
```

- [ ] **Step 6: Install and commit**

```bash
cd /Users/comchientrung/company/room-manager
pnpm install
git add packages/shared
git commit -m "feat: add shared package with types and constants"
```

---

### Task 3: Setup Backend Package (NestJS + Prisma)

**Files:**
- Create: `packages/backend/package.json`
- Create: `packages/backend/tsconfig.json`
- Create: `packages/backend/nest-cli.json`
- Create: `packages/backend/src/main.ts`
- Create: `packages/backend/src/app.module.ts`
- Create: `packages/backend/src/prisma/prisma.module.ts`
- Create: `packages/backend/src/prisma/prisma.service.ts`

- [ ] **Step 1: Create package.json**

Create `packages/backend/package.json`:
```json
{
  "name": "@room-manager/backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "nest start",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@prisma/client": "^6.2.0",
    "@supabase/supabase-js": "^2.49.0",
    "@room-manager/shared": "workspace:*",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.0",
    "@types/node": "^22.0.0",
    "jest": "^29.7.0",
    "prisma": "^6.2.0",
    "ts-jest": "^29.2.0",
    "ts-loader": "^9.5.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.8.0",
    "eslint": "^9.0.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "^@room-manager/shared$": "<rootDir>/../../shared/src"
    }
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@room-manager/shared": ["../shared/src"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create nest-cli.json**

Create `packages/backend/nest-cli.json`:
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create Prisma service**

Create `packages/backend/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `packages/backend/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 5: Create app module and main**

Create `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
})
export class AppModule {}
```

Create `packages/backend/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
```

- [ ] **Step 6: Create e2e test config**

Create `packages/backend/test/jest-e2e.json`:
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

- [ ] **Step 7: Create .env template**

Create `packages/backend/.env.example`:
```
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_JWT_SECRET="your-jwt-secret"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

- [ ] **Step 8: Install deps and verify**

```bash
cd /Users/comchientrung/company/room-manager
pnpm install
cd packages/backend
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend
git commit -m "feat: scaffold NestJS backend with Prisma service"
```

---

### Task 4: Prisma Schema (Full Database)

**Files:**
- Create: `packages/backend/prisma/schema.prisma`

- [ ] **Step 1: Write the full Prisma schema**

Create `packages/backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String   @id @default(cuid())
  supabaseUserId  String   @unique @map("supabase_user_id")
  email           String?
  phone           String?
  name            String
  avatar          String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  properties     Property[]
  userFeatures   UserFeature[]
  purchaseHistory PurchaseHistory[]
  subscriptions  Subscription[]

  @@map("users")
}

model Property {
  id        String   @id @default(cuid())
  ownerId   String   @map("owner_id")
  name      String
  address   String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  owner          User            @relation(fields: [ownerId], references: [id])
  rooms          Room[]
  serviceFees    ServiceFee[]
  utilityConfigs UtilityConfig[]
  expenses       Expense[]

  @@map("properties")
}

enum RoomStatus {
  VACANT
  OCCUPIED
  MAINTENANCE
}

enum RentCalcType {
  FIXED
  PER_PERSON
}

model Room {
  id                 String       @id @default(cuid())
  propertyId         String       @map("property_id")
  name               String
  floor              Int?
  rentPrice          Int          @map("rent_price")
  rentCalcType       RentCalcType @default(FIXED) @map("rent_calc_type")
  rentPerPersonPrice Int?         @map("rent_per_person_price")
  status             RoomStatus   @default(VACANT)
  createdAt          DateTime     @default(now()) @map("created_at")
  updatedAt          DateTime     @updatedAt @map("updated_at")

  property        Property         @relation(fields: [propertyId], references: [id])
  tenants         Tenant[]
  meterReadings   MeterReading[]
  invoices        Invoice[]
  contracts       Contract[]
  expenses        Expense[]
  roomServiceFees RoomServiceFee[]

  @@map("rooms")
}

enum TenantStatus {
  ACTIVE
  MOVED_OUT
}

model Tenant {
  id           String       @id @default(cuid())
  roomId       String       @map("room_id")
  name         String
  phone        String?
  idCard       String?      @map("id_card")
  idCardImage  String?      @map("id_card_image")
  moveInDate   DateTime     @map("move_in_date")
  moveOutDate  DateTime?    @map("move_out_date")
  status       TenantStatus @default(ACTIVE)
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  room      Room       @relation(fields: [roomId], references: [id])
  invoices  Invoice[]
  contracts Contract[]

  @@map("tenants")
}

enum UtilityType {
  ELECTRIC
  WATER
}

enum UtilityCalcType {
  FIXED
  TIERED
  PER_PERSON
  FIXED_PER_ROOM
}

model UtilityConfig {
  id             String          @id @default(cuid())
  propertyId     String          @map("property_id")
  type           UtilityType
  calcType       UtilityCalcType @map("calc_type")
  unitPrice      Int?            @map("unit_price")
  perPersonPrice Int?            @map("per_person_price")
  fixedRoomPrice Int?            @map("fixed_room_price")
  tiers          Json?
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  property Property @relation(fields: [propertyId], references: [id])

  @@unique([propertyId, type])
  @@map("utility_configs")
}

enum FeeCalcType {
  FIXED_PER_ROOM
  PER_PERSON
  PER_QUANTITY
}

enum FeeApplyTo {
  ALL
  SELECTED_ROOMS
}

model ServiceFee {
  id         String     @id @default(cuid())
  propertyId String     @map("property_id")
  name       String
  calcType   FeeCalcType @map("calc_type")
  unitPrice  Int        @map("unit_price")
  applyTo    FeeApplyTo @default(ALL) @map("apply_to")
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")

  property        Property         @relation(fields: [propertyId], references: [id])
  roomServiceFees RoomServiceFee[]

  @@map("service_fees")
}

model RoomServiceFee {
  id           String  @id @default(cuid())
  roomId       String  @map("room_id")
  serviceFeeId String  @map("service_fee_id")
  enabled      Boolean @default(true)
  customPrice  Int?    @map("custom_price")
  quantity     Int?

  room       Room       @relation(fields: [roomId], references: [id])
  serviceFee ServiceFee @relation(fields: [serviceFeeId], references: [id])

  @@unique([roomId, serviceFeeId])
  @@map("room_service_fees")
}

model MeterReading {
  id            String      @id @default(cuid())
  roomId        String      @map("room_id")
  type          UtilityType
  readingValue  Int         @map("reading_value")
  previousValue Int         @map("previous_value")
  readingDate   DateTime    @map("reading_date")
  createdAt     DateTime    @default(now()) @map("created_at")

  room Room @relation(fields: [roomId], references: [id])

  @@map("meter_readings")
}

enum InvoiceStatus {
  PENDING
  PARTIAL
  PAID
}

model Invoice {
  id                String        @id @default(cuid())
  roomId            String        @map("room_id")
  tenantId          String        @map("tenant_id")
  billingPeriod     String        @map("billing_period")
  roomFee           Int           @map("room_fee")
  electricFee       Int           @default(0) @map("electric_fee")
  waterFee          Int           @default(0) @map("water_fee")
  serviceFeesDetail Json?         @map("service_fees_detail")
  discount          Int           @default(0)
  total             Int
  paidAmount        Int           @default(0) @map("paid_amount")
  status            InvoiceStatus @default(PENDING)
  dueDate           DateTime?     @map("due_date")
  paidDate          DateTime?     @map("paid_date")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  room     Room      @relation(fields: [roomId], references: [id])
  tenant   Tenant    @relation(fields: [tenantId], references: [id])
  payments Payment[]

  @@map("invoices")
}

enum PaymentMethod {
  CASH
  TRANSFER
  OTHER
}

model Payment {
  id          String        @id @default(cuid())
  invoiceId   String        @map("invoice_id")
  amount      Int
  paymentDate DateTime      @map("payment_date")
  method      PaymentMethod @default(CASH)
  note        String?
  createdAt   DateTime      @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id])

  @@map("payments")
}

enum DepositStatus {
  PENDING
  PAID
  RETURNED
  DEDUCTED
}

model Contract {
  id            String        @id @default(cuid())
  roomId        String        @map("room_id")
  tenantId      String        @map("tenant_id")
  startDate     DateTime      @map("start_date")
  endDate       DateTime?     @map("end_date")
  depositAmount Int           @default(0) @map("deposit_amount")
  depositStatus DepositStatus @default(PENDING) @map("deposit_status")
  terms         String?
  templateId    String?       @map("template_id")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  room   Room   @relation(fields: [roomId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@map("contracts")
}

enum ExpenseType {
  INCOME
  EXPENSE
}

model Expense {
  id         String      @id @default(cuid())
  propertyId String      @map("property_id")
  roomId     String?     @map("room_id")
  category   String
  type       ExpenseType
  amount     Int
  date       DateTime
  note       String?
  createdAt  DateTime    @default(now()) @map("created_at")

  property Property @relation(fields: [propertyId], references: [id])
  room     Room?    @relation(fields: [roomId], references: [id])

  @@map("expenses")
}

model UserFeature {
  id         String    @id @default(cuid())
  userId     String    @map("user_id")
  featureKey String    @map("feature_key")
  purchasedAt DateTime @default(now()) @map("purchased_at")
  expiresAt  DateTime? @map("expires_at")

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, featureKey])
  @@map("user_features")
}

enum PurchaseStatus {
  ACTIVE
  UPGRADED
  VOID
}

model PurchaseHistory {
  id          String         @id @default(cuid())
  userId      String         @map("user_id")
  featureKey  String         @map("feature_key")
  amountPaid  Int            @map("amount_paid")
  purchasedAt DateTime       @default(now()) @map("purchased_at")
  status      PurchaseStatus @default(ACTIVE)

  user User @relation(fields: [userId], references: [id])

  @@map("purchase_history")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
}

model Subscription {
  id                 String             @id @default(cuid())
  userId             String             @map("user_id")
  plan               String
  status             SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime           @map("current_period_start")
  currentPeriodEnd   DateTime           @map("current_period_end")

  user User @relation(fields: [userId], references: [id])

  @@map("subscriptions")
}

enum PricingTierType {
  SINGLE
  SLOT
  BUNDLE
}

model PricingTier {
  id               String          @id @default(cuid())
  featureKey       String          @map("feature_key")
  tierType         PricingTierType @map("tier_type")
  tierName         String          @map("tier_name")
  price            Int
  discountPercent  Int             @default(0) @map("discount_percent")
  includedFeatures Json?           @map("included_features")
  slotSize         Int?            @map("slot_size")
  isActive         Boolean         @default(true) @map("is_active")

  @@map("pricing_tiers")
}

model AdConfig {
  id       String  @id @default(cuid())
  position String
  type     String
  enabled  Boolean @default(true)
  content  Json?

  impressions AdImpression[]

  @@map("ad_config")
}

model AdImpression {
  id         String   @id @default(cuid())
  adConfigId String   @map("ad_config_id")
  userId     String?  @map("user_id")
  type       String
  createdAt  DateTime @default(now()) @map("created_at")

  adConfig AdConfig @relation(fields: [adConfigId], references: [id])

  @@map("ad_impressions")
}
```

- [ ] **Step 2: Generate Prisma client**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
npx prisma generate
```

Expected: Prisma Client generated successfully.

- [ ] **Step 3: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/prisma
git commit -m "feat: add full Prisma schema for all entities"
```

---

### Task 5: NestJS Auth Module (Supabase JWT)

**Files:**
- Create: `packages/backend/src/auth/auth.module.ts`
- Create: `packages/backend/src/auth/auth.service.ts`
- Create: `packages/backend/src/auth/auth.guard.ts`
- Create: `packages/backend/src/auth/auth.controller.ts`
- Create: `packages/backend/src/auth/decorators/current-user.decorator.ts`
- Create: `packages/backend/src/auth/__tests__/auth.service.spec.ts`
- Create: `packages/backend/src/auth/__tests__/auth.guard.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Write auth service test**

Create `packages/backend/src/auth/__tests__/auth.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) => {
              const config: Record<string, string> = {
                SUPABASE_URL: 'https://test.supabase.co',
                SUPABASE_SERVICE_ROLE_KEY: 'test-key',
                SUPABASE_JWT_SECRET: 'test-secret',
              };
              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null for invalid token', async () => {
    const result = await service.verifyToken('invalid-token');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="auth.service.spec"
```

Expected: FAIL — `Cannot find module '../auth.service'`

- [ ] **Step 3: Implement auth service**

Create `packages/backend/src/auth/auth.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow('SUPABASE_URL'),
      this.configService.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async verifyToken(token: string): Promise<SupabaseUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) return null;

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
      };
    } catch {
      return null;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="auth.service.spec"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Write auth guard test**

Create `packages/backend/src/auth/__tests__/auth.guard.spec.ts`:
```typescript
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: Partial<AuthService>;
  let usersService: Partial<UsersService>;

  beforeEach(() => {
    authService = {
      verifyToken: jest.fn(),
    };
    usersService = {
      upsertFromSupabase: jest.fn(),
    };
    guard = new AuthGuard(
      authService as AuthService,
      usersService as UsersService,
    );
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: { authorization: authHeader },
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException when no auth header', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    (authService.verifyToken as jest.Mock).mockResolvedValue(null);
    const context = createMockContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set request.user and return true for valid token', async () => {
    const supabaseUser = {
      id: 'sup-123',
      email: 'test@test.com',
    };
    const dbUser = {
      id: 'db-123',
      supabaseUserId: 'sup-123',
      email: 'test@test.com',
      phone: null,
      name: 'Test',
    };
    (authService.verifyToken as jest.Mock).mockResolvedValue(supabaseUser);
    (usersService.upsertFromSupabase as jest.Mock).mockResolvedValue(dbUser);

    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(dbUser);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="auth.guard.spec"
```

Expected: FAIL — `Cannot find module '../auth.guard'`

- [ ] **Step 7: Implement auth guard**

Create `packages/backend/src/auth/auth.guard.ts`:
```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }

    const token = authHeader.slice(7);
    const supabaseUser = await this.authService.verifyToken(token);

    if (!supabaseUser) {
      throw new UnauthorizedException();
    }

    request.user = await this.usersService.upsertFromSupabase(supabaseUser);
    return true;
  }
}
```

- [ ] **Step 8: Create CurrentUser decorator**

Create `packages/backend/src/auth/decorators/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '@room-manager/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 9: Create auth controller**

Create `packages/backend/src/auth/auth.controller.ts`:
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return user;
  }
}
```

- [ ] **Step 10: Create auth module**

Create `packages/backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 11: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/src/auth
git commit -m "feat: add auth module with Supabase JWT verification"
```

---

### Task 6: NestJS Users Module

**Files:**
- Create: `packages/backend/src/users/users.module.ts`
- Create: `packages/backend/src/users/users.service.ts`
- Create: `packages/backend/src/users/users.controller.ts`
- Create: `packages/backend/src/users/__tests__/users.service.spec.ts`
- Modify: `packages/backend/src/app.module.ts`

- [ ] **Step 1: Write users service test**

Create `packages/backend/src/users/__tests__/users.service.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: Record<string, jest.Mock> };

  beforeEach(async () => {
    prisma = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('upsertFromSupabase', () => {
    it('should create user on first login', async () => {
      const supabaseUser = {
        id: 'sup-123',
        email: 'test@test.com',
        phone: undefined,
      };
      const expectedUser = {
        id: 'db-1',
        supabaseUserId: 'sup-123',
        email: 'test@test.com',
        phone: null,
        name: 'test',
      };
      prisma.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.upsertFromSupabase(supabaseUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { supabaseUserId: 'sup-123' },
        create: {
          supabaseUserId: 'sup-123',
          email: 'test@test.com',
          phone: null,
          name: 'test',
        },
        update: {
          email: 'test@test.com',
          phone: null,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should derive name from phone when no email', async () => {
      const supabaseUser = {
        id: 'sup-456',
        email: undefined,
        phone: '+84901234567',
      };
      const expectedUser = {
        id: 'db-2',
        supabaseUserId: 'sup-456',
        email: null,
        phone: '+84901234567',
        name: '+84901234567',
      };
      prisma.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.upsertFromSupabase(supabaseUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ name: '+84901234567' }),
        }),
      );
      expect(result).toEqual(expectedUser);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="users.service.spec"
```

Expected: FAIL — `Cannot find module '../users.service'`

- [ ] **Step 3: Implement users service**

Create `packages/backend/src/users/users.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '@room-manager/shared';
import { SupabaseUser } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertFromSupabase(supabaseUser: SupabaseUser): Promise<AuthUser> {
    const email = supabaseUser.email || null;
    const phone = supabaseUser.phone || null;
    const name = email?.split('@')[0] || phone || 'User';

    const user = await this.prisma.user.upsert({
      where: { supabaseUserId: supabaseUser.id },
      create: {
        supabaseUserId: supabaseUser.id,
        email,
        phone,
        name,
      },
      update: {
        email,
        phone,
      },
    });

    return {
      id: user.id,
      supabaseUserId: user.supabaseUserId,
      email: user.email,
      phone: user.phone,
      name: user.name,
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test -- --testPathPattern="users.service.spec"
```

Expected: 2 tests PASS.

- [ ] **Step 5: Create users controller and module**

Create `packages/backend/src/users/users.controller.ts`:
```typescript
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() body: { name?: string; avatar?: string },
  ) {
    return this.usersService.updateProfile(user.id, body);
  }
}
```

Create `packages/backend/src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 6: Update app.module.ts**

Update `packages/backend/src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Run all tests**

```bash
cd /Users/comchientrung/company/room-manager/packages/backend
pnpm test
```

Expected: All tests PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/backend/src
git commit -m "feat: add users module with upsert on first login"
```

---

### Task 7: Setup Frontend Package (Next.js 16)

**Files:**
- Create: `packages/frontend/package.json`
- Create: `packages/frontend/next.config.ts`
- Create: `packages/frontend/tsconfig.json`
- Create: `packages/frontend/tailwind.config.ts`
- Create: `packages/frontend/postcss.config.mjs`
- Create: `packages/frontend/components.json`
- Create: `packages/frontend/src/app/layout.tsx`
- Create: `packages/frontend/src/app/page.tsx`
- Create: `packages/frontend/src/app/globals.css`
- Create: `packages/frontend/src/lib/api.ts`

- [ ] **Step 1: Create package.json**

Create `packages/frontend/package.json`:
```json
{
  "name": "@room-manager/frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.49.0",
    "@supabase/ssr": "^0.6.0",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "@room-manager/shared": "workspace:*",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

Create `packages/frontend/next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@room-manager/shared'],
};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

Create `packages/frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@room-manager/shared": ["../shared/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create TailwindCSS config**

Create `packages/frontend/postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

Create `packages/frontend/src/app/globals.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 5: Create Shadcn config**

Create `packages/frontend/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "blue",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 6: Create utility functions**

Create `packages/frontend/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `packages/frontend/src/lib/api.ts`:
```typescript
import { createBrowserClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        Authorization: `Bearer ${session.access_token}`,
      }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 7: Create root layout and page**

Create `packages/frontend/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
```

Create `packages/frontend/src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

- [ ] **Step 8: Create .env template**

Create `packages/frontend/.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

- [ ] **Step 9: Install and verify**

```bash
cd /Users/comchientrung/company/room-manager
pnpm install
cd packages/frontend
pnpm build
```

Expected: Build succeeds (may warn about no pages, that's OK).

- [ ] **Step 10: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend
git commit -m "feat: scaffold Next.js 16 frontend with TailwindCSS and Shadcn"
```

---

### Task 8: Supabase Client Setup

**Files:**
- Create: `packages/frontend/src/lib/supabase/client.ts`
- Create: `packages/frontend/src/lib/supabase/server.ts`
- Create: `packages/frontend/src/lib/supabase/middleware.ts`
- Create: `packages/frontend/middleware.ts`

- [ ] **Step 1: Create browser client**

Create `packages/frontend/src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient as createClient } from '@supabase/ssr';

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Create server client**

Create `packages/frontend/src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignore in Server Components (read-only)
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Create middleware helper**

Create `packages/frontend/src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Create Next.js middleware**

Create `packages/frontend/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend/src/lib/supabase packages/frontend/middleware.ts
git commit -m "feat: add Supabase auth client with session middleware"
```

---

### Task 9: Auth Pages (Login, Register, Onboarding)

**Files:**
- Create: `packages/frontend/src/app/(auth)/layout.tsx`
- Create: `packages/frontend/src/app/(auth)/login/page.tsx`
- Create: `packages/frontend/src/components/auth/login-form.tsx`
- Create: `packages/frontend/src/app/(auth)/register/page.tsx`
- Create: `packages/frontend/src/components/auth/register-form.tsx`
- Create: `packages/frontend/src/app/(auth)/onboarding/page.tsx`
- Create: `packages/frontend/src/components/auth/onboarding-wizard.tsx`
- Create: `packages/frontend/src/hooks/use-auth.ts`

- [ ] **Step 1: Install Shadcn components needed**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
npx shadcn@latest add button input label card
```

- [ ] **Step 2: Create auth layout**

Create `packages/frontend/src/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Create useAuth hook**

Create `packages/frontend/src/hooks/use-auth.ts`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const signInWithOtp = async (phone: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const verifyOtp = async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    router.push('/onboarding');
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return {
    loading,
    error,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    signInWithEmail,
    signUp,
    signOut,
  };
}
```

- [ ] **Step 4: Create login form component**

Create `packages/frontend/src/components/auth/login-form.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function LoginForm() {
  const { loading, error, signInWithGoogle, signInWithOtp, verifyOtp } =
    useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = async () => {
    const success = await signInWithOtp(phone);
    if (success) setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    await verifyOtp(phone, otp);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Room Manager</h1>
        <p className="text-muted-foreground">Chào mừng trở lại</p>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Đăng nhập bằng Google
      </Button>

      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">HOẶC</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {!otpSent ? (
        <div className="flex w-full flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSendOtp}
            disabled={loading || !phone}
          >
            Gửi OTP
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="otp">Nhập mã OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
          >
            Xác nhận
          </Button>
          <button
            className="text-sm text-muted-foreground underline"
            onClick={() => setOtpSent(false)}
          >
            Đổi số điện thoại
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Link
        href="/login?method=email"
        className="text-sm text-blue-600 hover:underline"
      >
        Đăng nhập bằng Email/Mật khẩu
      </Link>

      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-blue-600 underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Create login page**

Create `packages/frontend/src/app/(auth)/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return <LoginForm />;
}
```

- [ ] **Step 6: Create register form component**

Create `packages/frontend/src/components/auth/register-form.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function RegisterForm() {
  const { loading, error, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    await signUp(email, password, name);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Bắt đầu quản lý ngay</h1>
        <p className="text-center text-sm text-muted-foreground">
          Room Manager - Giải pháp tối ưu cho phòng trọ của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            placeholder="Nhập họ và tên của bạn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email / Số điện thoại</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email hoặc số điện thoại"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tạo mật khẩu an toàn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-muted-foreground">
            Tôi đồng ý với{' '}
            <a href="#" className="text-blue-600 underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-blue-600 underline">
              Chính sách bảo mật
            </a>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !agreed}>
          Đăng ký
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-blue-600 underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Create register page**

Create `packages/frontend/src/app/(auth)/register/page.tsx`:
```tsx
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return <RegisterForm />;
}
```

- [ ] **Step 8: Create onboarding wizard**

Create `packages/frontend/src/components/auth/onboarding-wizard.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProperty = async () => {
    setLoading(true);
    try {
      await apiFetch('/properties', {
        method: 'POST',
        body: JSON.stringify({ name: propertyName, address }),
      });
      setStep(2);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: roomName,
          rentPrice: parseInt(rentPrice) || 0,
        }),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const skip = () => {
    if (step === 1) setStep(2);
    else router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {step === 1 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🏘️
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Xin chào!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy bắt đầu bằng việc thiết lập khu trọ đầu tiên của bạn.
            </p>
          </div>

          <div className="w-full rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                BƯỚC 1 / 2
              </span>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-blue-600" />
                <div className="h-2 w-8 rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên khu trọ/nhà trọ</Label>
                <Input
                  placeholder="VD: Nhà trọ An Bình"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  placeholder="Nhập địa chỉ đầy đủ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateProperty}
            disabled={loading || !propertyName}
          >
            Tiếp tục →
          </Button>
          <button
            className="text-sm text-muted-foreground"
            onClick={skip}
          >
            Bỏ qua
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Thêm căn phòng đầu tiên</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy bắt đầu bằng việc tạo phòng đầu tiên cho khu trọ của bạn.
            </p>
          </div>

          <div className="w-full rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                BƯỚC 2 / 2
              </span>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-blue-600" />
                <div className="h-2 w-8 rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>TÊN/SỐ PHÒNG</Label>
                <Input
                  placeholder="VD: Phòng 101, Tầng 1..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GIÁ THUÊ HÀNG THÁNG</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    VNĐ
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Giá cơ bản chưa bao gồm điện nước và dịch vụ khác.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            Hoàn tất →
          </Button>
          <button
            className="text-sm text-muted-foreground"
            onClick={skip}
          >
            Bỏ qua
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Create onboarding page**

Create `packages/frontend/src/app/(auth)/onboarding/page.tsx`:
```tsx
import { OnboardingWizard } from '@/components/auth/onboarding-wizard';

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
```

- [ ] **Step 10: Verify build**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 11: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend/src
git commit -m "feat: add auth pages (login, register, onboarding)"
```

---

### Task 10: Dashboard Layout (Sidebar + Bottom Nav)

**Files:**
- Create: `packages/frontend/src/components/layout/sidebar.tsx`
- Create: `packages/frontend/src/components/layout/bottom-nav.tsx`
- Create: `packages/frontend/src/components/layout/top-bar.tsx`
- Create: `packages/frontend/src/app/(dashboard)/layout.tsx`
- Create: `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Install Shadcn components**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
npx shadcn@latest add badge avatar dropdown-menu
```

- [ ] **Step 2: Create top bar (mobile)**

Create `packages/frontend/src/components/layout/top-bar.tsx`:
```tsx
'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TopBarProps {
  propertyName: string;
}

export function TopBar({ propertyName }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-sm text-white">
          {propertyName[0]?.toUpperCase() || 'R'}
        </AvatarFallback>
      </Avatar>

      <button className="flex items-center gap-1 text-sm font-semibold">
        {propertyName}
        <span className="text-muted-foreground">▾</span>
      </button>

      <button className="relative">
        <Bell className="h-5 w-5 text-gray-600" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          3
        </span>
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Create bottom nav (mobile)**

Create `packages/frontend/src/components/layout/bottom-nav.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  DoorOpen,
  Receipt,
  Gauge,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-xs',
                isActive
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-500',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create sidebar (desktop)**

Create `packages/frontend/src/components/layout/sidebar.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  DoorOpen,
  Receipt,
  Gauge,
  Settings,
  Users,
  FileText,
  TrendingUp,
  Wallet,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

const premiumNavItems = [
  { href: '/tenants', label: 'Người thuê', icon: Users, locked: false },
  { href: '/contracts', label: 'Hợp đồng', icon: FileText, locked: true },
  { href: '/expenses', label: 'Thu/Chi', icon: Wallet, locked: true },
  { href: '/reports', label: 'Báo cáo', icon: TrendingUp, locked: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-white">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg text-white">
          🏠
        </div>
        <div>
          <p className="text-sm font-bold">Room Manager</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-2 border-t" />

        {premiumNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.locked ? '/store' : item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50',
                item.locked && 'opacity-60',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.locked && <Lock className="ml-auto h-3 w-3" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 5: Create dashboard layout**

Create `packages/frontend/src/app/(dashboard)/layout.tsx`:
```tsx
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TopBar } from '@/components/layout/top-bar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar propertyName="Trọ Hoa Sen" />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create dashboard placeholder page**

Create `packages/frontend/src/app/(dashboard)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          TỔNG THU THÁNG NÀY
        </p>
        <p className="mt-1 text-3xl font-bold text-gray-900">0đ</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
            + Tạo hóa đơn
          </button>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
            📋 Ghi số
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tổng phòng</p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Đang thuê</p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">🏠</p>
        <p className="mt-3 font-medium">Chưa có phòng nào</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thêm phòng đầu tiên để bắt đầu quản lý.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Update root page redirect**

Update `packages/frontend/src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

- [ ] **Step 8: Verify build**

```bash
cd /Users/comchientrung/company/room-manager/packages/frontend
pnpm build
```

Expected: Build succeeds.

- [ ] **Step 9: Commit**

```bash
cd /Users/comchientrung/company/room-manager
git add packages/frontend
git commit -m "feat: add dashboard layout with sidebar and bottom nav"
```

---

## Phase Summary

After completing all 10 tasks, you will have:

- **Monorepo** scaffolded with pnpm workspace (shared, backend, frontend packages)
- **Full Prisma schema** covering all entities from the spec
- **NestJS backend** with auth module (Supabase JWT verification), users module (auto-upsert on first login)
- **Next.js frontend** with Supabase client, auth middleware, login/register/onboarding pages
- **Core layout** with mobile bottom nav + desktop sidebar + top bar
- **Dashboard placeholder** with hero card, stat cards, empty state

## Next Phases

- **Phase 2:** Properties, Rooms, Tenants CRUD (API endpoints + frontend pages)
- **Phase 3:** Meter readings, Service fees config, Invoice generation, Payments
- **Phase 4:** Feature-gating, Store/pricing page, Purchase flow, Ads
- **Phase 5:** Contracts, Expenses, Financial reports (premium features)
- **Phase 6:** Push notifications, PWA setup, polish
