import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { MeterReadingsService } from './meter-readings.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';

@Controller('api/v1/rooms/:roomId/meter-readings')
@UseGuards(AuthGuard)
export class MeterReadingsController {
  constructor(private meterReadingsService: MeterReadingsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Body() dto: CreateMeterReadingDto,
  ) {
    return this.meterReadingsService.create(user.id, roomId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('roomId') roomId: string,
    @Query('type') type?: string,
  ) {
    return this.meterReadingsService.findAll(user.id, roomId, type);
  }
}
