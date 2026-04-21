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
