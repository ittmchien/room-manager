import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController, ExpensesByPropertyController } from './expenses.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExpensesByPropertyController, ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
