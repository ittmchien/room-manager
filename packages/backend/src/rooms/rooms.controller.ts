import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '@room-manager/shared';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller({ path: 'properties/:propertyId/rooms', version: '1' })
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomsService.create(user.id, propertyId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Param('propertyId') propertyId: string) {
    return this.roomsService.findAllByProperty(user.id, propertyId);
  }
}

@Controller({ path: 'rooms', version: '1' })
@UseGuards(AuthGuard)
export class RoomByIdController {
  constructor(private roomsService: RoomsService) {}

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roomsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roomsService.remove(user.id, id);
  }
}
