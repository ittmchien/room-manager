import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceFeeDto } from './dto/create-service-fee.dto';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';

@Injectable()
export class ServiceFeesService {
  constructor(private prisma: PrismaService) {}

  private async verifyPropertyOwnership(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');
    return property;
  }

  private async verifyFeeOwnership(userId: string, id: string) {
    const fee = await this.prisma.serviceFee.findFirst({
      where: { id, property: { ownerId: userId } },
    });
    if (!fee) throw new NotFoundException('Không tìm thấy phí dịch vụ');
    return fee;
  }

  async create(userId: string, propertyId: string, dto: CreateServiceFeeDto) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.serviceFee.create({
      data: {
        propertyId,
        name: dto.name,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        applyTo: dto.applyTo ?? 'ALL',
      },
    });
  }

  async findAll(userId: string, propertyId: string) {
    await this.verifyPropertyOwnership(userId, propertyId);
    return this.prisma.serviceFee.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateServiceFeeDto) {
    await this.verifyFeeOwnership(userId, id);
    return this.prisma.serviceFee.update({
      where: { id },
      data: {
        name: dto.name,
        calcType: dto.calcType,
        unitPrice: dto.unitPrice,
        applyTo: dto.applyTo,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.verifyFeeOwnership(userId, id);
    return this.prisma.serviceFee.delete({ where: { id } });
  }
}
