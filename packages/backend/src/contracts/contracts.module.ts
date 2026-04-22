import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ContractsService } from './contracts.service';
import { ContractsController, ContractsByPropertyController } from './contracts.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContractsByPropertyController, ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
