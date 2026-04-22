import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Guard that blocks access to premium-tier endpoints when PREMIUM_ENABLED !== 'true'.
 * Apply with @UseGuards(AuthGuard, PremiumGuard) — AuthGuard first.
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(_ctx: ExecutionContext): boolean {
    if (process.env.PREMIUM_ENABLED !== 'true') {
      throw new ForbiddenException('premium_feature_disabled');
    }
    return true;
  }
}
