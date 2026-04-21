import { Module, forwardRef } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController, RoomByIdController } from './rooms.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RoomsService],
  controllers: [RoomsController, RoomByIdController],
  exports: [RoomsService],
})
export class RoomsModule {}
