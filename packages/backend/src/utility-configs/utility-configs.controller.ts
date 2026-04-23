import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { UtilityConfigsService } from './utility-configs.service';
import { UpsertUtilityConfigDto } from './dto/upsert-utility-config.dto';

@Controller({ path: 'properties/:propertyId/utility-configs', version: '1' })
@UseGuards(AuthGuard)
export class UtilityConfigsController {
  constructor(private utilityConfigsService: UtilityConfigsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.utilityConfigsService.findAll(user.id, propertyId);
  }

  @Put(':type')
  upsert(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Param('type') type: 'ELECTRIC' | 'WATER',
    @Body() dto: UpsertUtilityConfigDto,
  ) {
    return this.utilityConfigsService.upsert(user.id, propertyId, type, dto);
  }
}
