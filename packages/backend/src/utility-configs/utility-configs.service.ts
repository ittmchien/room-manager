import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertUtilityConfigDto } from './dto/upsert-utility-config.dto';

@Injectable()
export class UtilityConfigsService {
  constructor(private prisma: PrismaService) {}

  private async verifyPropertyOwnership(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  async findAll(userId: string, propertyId: string) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.utilityConfig.findMany({ where: { propertyId } });
  }

  async upsert(
    userId: string,
    propertyId: string,
    type: 'ELECTRIC' | 'WATER',
    dto: UpsertUtilityConfigDto,
  ) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.utilityConfig.upsert({
      where: { propertyId_type: { propertyId, type } },
      create: {
        propertyId,
        type,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        perPersonPrice: dto.perPersonPrice,
        fixedRoomPrice: dto.fixedRoomPrice,
      },
      update: {
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        perPersonPrice: dto.perPersonPrice,
        fixedRoomPrice: dto.fixedRoomPrice,
      },
    });
  }
}
