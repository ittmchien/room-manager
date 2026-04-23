import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('rooms/:roomId/tenants')
@UseGuards(AuthGuard)
export class TenantsByRoomController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(user.id, roomId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('roomId') roomId: string) {
    return this.tenantsService.findAllByRoom(user.id, roomId);
  }
}

@Controller('tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user.id, id, dto);
  }

  @Post(':id/checkout')
  checkout(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.tenantsService.checkout(user.id, id);
  }
}
