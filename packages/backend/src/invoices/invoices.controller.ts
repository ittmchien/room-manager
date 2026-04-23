import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { InvoicesService } from './invoices.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@Controller('api/v1/invoices')
@UseGuards(AuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post('generate')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateInvoicesDto) {
    return this.invoicesService.generate(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invoicesService.findOne(user.id, id);
  }
}

@Controller('api/v1/properties/:propertyId/invoices')
@UseGuards(AuthGuard)
export class PropertyInvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Query('billingPeriod') billingPeriod?: string,
  ) {
    return this.invoicesService.findAll(user.id, propertyId, billingPeriod);
  }
}
