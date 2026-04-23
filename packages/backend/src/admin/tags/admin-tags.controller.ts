import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminTagsService } from './admin-tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';
import { BulkAssignTagDto } from './dto/bulk-assign-tag.dto';

@Controller({ path: 'admin/tags', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminTagsController {
  constructor(private adminTagsService: AdminTagsService) {}

  @Get()
  findAll() {
    return this.adminTagsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.adminTagsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.adminTagsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTagsService.remove(id);
  }

  @Post(':id/bulk-assign')
  bulkAssign(@Param('id') id: string, @Body() dto: BulkAssignTagDto) {
    return this.adminTagsService.bulkAssign(id, dto.userIds);
  }
}
