import { Controller, Post, Delete, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('subscribe')
  subscribe(@CurrentUser() user: AuthUser, @Body() dto: SubscribeDto) {
    return this.notificationsService.subscribe(user.id, dto);
  }

  @Delete('subscribe')
  unsubscribe(
    @CurrentUser() user: AuthUser,
    @Query('endpoint') endpoint: string,
  ) {
    if (!endpoint) throw new BadRequestException('endpoint is required');
    return this.notificationsService.unsubscribe(user.id, endpoint);
  }
}
