import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  private async verifyRoomOwnership(userId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async create(userId: string, roomId: string, dto: CreateTenantDto) {
    await this.verifyRoomOwnership(userId, roomId);

    return this.prisma.tenant.create({
      data: {
        roomId,
        name: dto.name,
        phone: dto.phone,
        idCard: dto.idCard,
        idCardImage: dto.idCardImage,
        moveInDate: new Date(dto.moveInDate),
        status: 'ACTIVE',
      },
    });
  }

  async findAllByRoom(userId: string, roomId: string) {
    await this.verifyRoomOwnership(userId, roomId);

    return this.prisma.tenant.findMany({
      where: { roomId },
      orderBy: [{ status: 'asc' }, { moveInDate: 'desc' }],
    });
  }

  async update(userId: string, id: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
    });
    if (!tenant) throw new NotFoundException('Không tìm thấy người thuê');

    return this.prisma.tenant.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        idCard: dto.idCard,
        idCardImage: dto.idCardImage,
        status: dto.status,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        moveOutDate: dto.moveOutDate ? new Date(dto.moveOutDate) : undefined,
      },
    });
  }

  async checkout(userId: string, id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
    });
    if (!tenant) throw new NotFoundException('Không tìm thấy người thuê');

    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'MOVED_OUT', moveOutDate: new Date() },
    });
  }
}
