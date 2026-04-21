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
