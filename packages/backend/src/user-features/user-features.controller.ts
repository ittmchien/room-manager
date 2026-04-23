import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { UserFeaturesService } from './user-features.service';

@Controller({ path: 'me/features', version: '1' })
@UseGuards(AuthGuard)
export class UserFeaturesController {
  constructor(private userFeaturesService: UserFeaturesService) {}

  @Get()
  getFeatures(@CurrentUser() user: AuthUser) {
    return this.userFeaturesService.getActiveFeatures(user.id);
  }
}
