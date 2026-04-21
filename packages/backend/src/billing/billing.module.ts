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
