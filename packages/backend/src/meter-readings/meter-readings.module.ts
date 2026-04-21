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
