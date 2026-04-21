import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FEATURE_KEYS, FREE_ROOM_LIMIT } from '@room-manager/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

const SLOT_SIZE = 10;
const ROOMS_50_LIMIT = 50;

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  private async getRoomLimit(userId: string): Promise<number> {
    const features = await this.prisma.userFeature.findMany({
      where: { userId },
      select: { featureKey: true },
    });
    const featureKeys = features.map((f) => f.featureKey);
    if (featureKeys.includes(FEATURE_KEYS.ROOMS_50)) return ROOMS_50_LIMIT;
    const slotCount = featureKeys.filter((k) => k === FEATURE_KEYS.ROOMS_SLOT).length;
    return FREE_ROOM_LIMIT + slotCount * SLOT_SIZE;
  }

  async create(userId: string, propertyId: string, dto: CreateRoomDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const [totalRooms, limit] = await Promise.all([
      this.prisma.room.count({ where: { property: { ownerId: userId } } }),
      this.getRoomLimit(userId),
    ]);

    if (totalRooms >= limit) {
      throw new ForbiddenException(`Đã đạt giới hạn ${limit} phòng. Mua thêm slot để mở rộng.`);
    }

    return this.prisma.room.create({
      data: {
        propertyId,
        name: dto.name,
        floor: dto.floor,
        rentPrice: dto.rentPrice,
        rentCalcType: dto.rentCalcType ?? 'FIXED',
        rentPerPersonPrice: dto.rentPerPersonPrice,
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.room.findMany({
      where: { propertyId },
      include: {
        tenants: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true, phone: true },
        },
        _count: { select: { tenants: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const room = await this.prisma.room.findFirst({
      where: { id, property: { ownerId: userId } },
      include: {
        property: { select: { id: true, name: true } },
        tenants: { where: { status: 'ACTIVE' }, orderBy: { moveInDate: 'asc' } },
        _count: { select: { tenants: { where: { status: 'ACTIVE' } } } },
      },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async update(userId: string, id: string, dto: UpdateRoomDto) {
    await this.findOne(userId, id);
    return this.prisma.room.update({
      where: { id },
      data: {
        name: dto.name,
        floor: dto.floor,
        rentPrice: dto.rentPrice,
        rentCalcType: dto.rentCalcType,
        rentPerPersonPrice: dto.rentPerPersonPrice,
        status: dto.status,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.room.delete({ where: { id } });
  }
}
