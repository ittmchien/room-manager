import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('api/v1/admin/config')
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateConfigDto) {
    return this.configService.update(dto.configs, user.id);
  }
}
