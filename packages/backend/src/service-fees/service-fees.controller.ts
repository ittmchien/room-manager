import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ServiceFeesService } from './service-fees.service';
import { CreateServiceFeeDto } from './dto/create-service-fee.dto';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';

@Controller('api/v1/properties/:propertyId/service-fees')
@UseGuards(AuthGuard)
export class ServiceFeesController {
  constructor(private serviceFeesService: ServiceFeesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateServiceFeeDto,
  ) {
    return this.serviceFeesService.create(user.id, propertyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.serviceFeesService.findAll(user.id, propertyId);
  }
}

@Controller('api/v1/service-fees')
@UseGuards(AuthGuard)
export class ServiceFeeByIdController {
  constructor(private serviceFeesService: ServiceFeesService) {}

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateServiceFeeDto) {
    return this.serviceFeesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.serviceFeesService.remove(user.id, id);
  }
}
