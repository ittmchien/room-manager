import { BadRequestException, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ReportsService } from './reports.service';

@Controller({ path: 'properties/:propertyId/reports', version: '1' })
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlySummary(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Query('year') year?: string,
  ) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    if (isNaN(y) || y < 2000 || y > 2100) throw new BadRequestException('Năm không hợp lệ');
    return this.reportsService.getMonthlySummary(user.id, propertyId, y);
  }

  @Get('snapshot')
  getSnapshot(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.reportsService.getPropertySnapshot(user.id, propertyId);
  }
}
