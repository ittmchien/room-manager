import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
