import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminBillingService } from './admin-billing.service';
import { GrantFeaturesDto } from './dto/grant-features.dto';
import { RevokeFeatureDto } from './dto/revoke-feature.dto';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminBillingController {
  constructor(private adminBillingService: AdminBillingService) {}

  @Get('subscriptions')
  listSubscriptions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminBillingService.listSubscriptions(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('purchases')
  listPurchases(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminBillingService.listPurchases(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('features/grant')
  grantFeatures(@Body() dto: GrantFeaturesDto) {
    return this.adminBillingService.grantFeatures(dto);
  }

  @Delete('features/revoke')
  revokeFeature(@Body() dto: RevokeFeatureDto) {
    return this.adminBillingService.revokeFeature(dto.userId, dto.featureKey);
  }
}
