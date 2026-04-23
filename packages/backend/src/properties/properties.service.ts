import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FEATURE_KEYS, FREE_PROPERTY_LIMIT } from '@room-manager/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../admin/config/config.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService, private appConfig: ConfigService) {}

  async create(userId: string, dto: CreatePropertyDto) {
    const count = await this.prisma.property.count({ where: { ownerId: userId } });

    if (count >= FREE_PROPERTY_LIMIT && !this.appConfig.getBoolean('premium_enabled')) {
      const hasFeature = await this.prisma.userFeature.findUnique({
        where: { userId_featureKey: { userId, featureKey: FEATURE_KEYS.MULTI_PROPERTY } },
      });
      if (!hasFeature) {
        throw new ForbiddenException('Nâng cấp để quản lý nhiều khu trọ');
      }
    }

    return this.prisma.property.create({
      data: { ownerId: userId, name: dto.name, address: dto.address },
    });
  }

  async findAll(userId: string) {
    return this.prisma.property.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { rooms: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, ownerId: userId },
      include: { _count: { select: { rooms: true } } },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  async update(userId: string, id: string, dto: UpdatePropertyDto) {
    await this.findOne(userId, id);
    return this.prisma.property.update({
      where: { id },
      data: { name: dto.name, address: dto.address },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.property.delete({ where: { id } });
  }
}
