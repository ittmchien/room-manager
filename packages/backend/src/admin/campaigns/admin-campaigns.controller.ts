import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminCampaignsService } from './admin-campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';

@Controller({ path: 'admin/campaigns', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminCampaignsController {
  constructor(private service: AdminCampaignsService) {}

  @Get()
  findAll(@Query() dto: ListCampaignsDto) {
    return this.service.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Admin can also check applicable campaigns for a user
  @Get(':id/redemptions')
  getRedemptions(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
