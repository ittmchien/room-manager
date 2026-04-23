import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { ScheduleModule } from '@nestjs/schedule';
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
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ContractsModule } from './contracts/contracts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { UserFeaturesModule } from './user-features/user-features.module';
import { AdminModule } from './admin/admin.module';
import { AppConfigModule } from './admin/config/config.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(process.env.VERCEL ? [] : [ScheduleModule.forRoot()]),
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
    NotificationsModule,
    ContractsModule,
    ExpensesModule,
    ReportsModule,
    UserFeaturesModule,
    AppConfigModule,
    AdminModule,
  ],
})
export class AppModule {}
