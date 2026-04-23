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
import { AdminCampaignsController } from './campaigns/admin-campaigns.controller';
import { AdminCampaignsService } from './campaigns/admin-campaigns.service';
import { AdminPricingController } from './pricing/admin-pricing.controller';
import { AdminPricingService } from './pricing/admin-pricing.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [
    AdminUsersController,
    AdminTagsController,
    AdminBillingController,
    AdminConfigController,
    AdminCampaignsController,
    AdminPricingController,
  ],
  providers: [
    RolesGuard,
    AdminUsersService,
    AdminTagsService,
    AdminBillingService,
    ConfigService,
    AdminCampaignsService,
    AdminPricingService,
  ],
  exports: [ConfigService],
})
export class AdminModule {}
