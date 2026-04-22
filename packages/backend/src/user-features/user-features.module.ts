import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserFeaturesService } from './user-features.service';
import { UserFeaturesController } from './user-features.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserFeaturesController],
  providers: [UserFeaturesService],
  exports: [UserFeaturesService],
})
export class UserFeaturesModule {}
