import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '../admin/config/config.service';

/**
 * Guard that blocks access to premium-tier endpoints when premium_enabled config is false.
 * Apply with @UseGuards(AuthGuard, PremiumGuard) — AuthGuard first.
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private appConfig: ConfigService) {}

  canActivate(_ctx: ExecutionContext): boolean {
    if (!this.appConfig.getBoolean('premium_enabled')) {
      throw new ForbiddenException('premium_feature_disabled');
    }
    return true;
  }
}
