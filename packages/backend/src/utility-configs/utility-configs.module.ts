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
