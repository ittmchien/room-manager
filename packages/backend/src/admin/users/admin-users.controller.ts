import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { AdminUsersService } from './admin-users.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto, AssignTagsDto } from './dto/update-user.dto';

@Controller({ path: 'admin/users', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminUsersController {
  constructor(private adminUsersService: AdminUsersService) {}

  @Get()
  findAll(@Query() dto: ListUsersDto) {
    return this.adminUsersService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() currentUser: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.adminUsersService.update(id, dto, currentUser.role);
  }

  @Post(':id/tags')
  assignTags(@Param('id') id: string, @Body() dto: AssignTagsDto) {
    return this.adminUsersService.assignTags(id, dto.tags);
  }

  @Delete(':id/tags/:tag')
  removeTag(@Param('id') id: string, @Param('tag') tag: string) {
    return this.adminUsersService.removeTag(id, tag);
  }
}
