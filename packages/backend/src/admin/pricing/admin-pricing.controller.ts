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
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { AdminPricingService } from './admin-pricing.service';
import { CreatePricingTierDto } from './dto/create-pricing-tier.dto';
import { UpdatePricingTierDto } from './dto/update-pricing-tier.dto';

@Controller({ path: 'admin/pricing', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminPricingController {
  constructor(private service: AdminPricingService) {}

  @Get()
  findAll(@Query('featureKey') featureKey?: string) {
    return this.service.findAll(featureKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePricingTierDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePricingTierDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
