import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('api/v1/properties/:propertyId/contracts')
@UseGuards(AuthGuard)
export class ContractsByPropertyController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.contractsService.findAllByProperty(user.id, propertyId);
  }
}

@Controller('api/v1/contracts')
@UseGuards(AuthGuard)
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.contractsService.create(user.id, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contractsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.contractsService.remove(user.id, id);
  }
}
