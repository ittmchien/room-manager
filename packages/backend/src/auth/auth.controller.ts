import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: AuthUser) {
    return user;
  }
}
