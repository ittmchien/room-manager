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
