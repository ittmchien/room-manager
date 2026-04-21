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
