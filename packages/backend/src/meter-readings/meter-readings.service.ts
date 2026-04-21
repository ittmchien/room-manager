import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeterReadingDto } from './dto/create-meter-reading.dto';

@Injectable()
export class MeterReadingsService {
  constructor(private prisma: PrismaService) {}

  private async verifyRoomOwnership(userId: string, roomId: string) {
    const room = await this.prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async create(userId: string, roomId: string, dto: CreateMeterReadingDto) {
    await this.verifyRoomOwnership(userId, roomId);
    return this.prisma.meterReading.create({
      data: {
        roomId,
        type: dto.type,
        readingValue: dto.readingValue,
        previousValue: dto.previousValue,
        readingDate: new Date(dto.readingDate),
      },
    });
  }

  async findAll(userId: string, roomId: string, type?: string) {
    await this.verifyRoomOwnership(userId, roomId);
    return this.prisma.meterReading.findMany({
      where: {
        roomId,
        ...(type ? { type: type as 'ELECTRIC' | 'WATER' } : {}),
      },
      orderBy: { readingDate: 'desc' },
      take: 12,
    });
  }
}
