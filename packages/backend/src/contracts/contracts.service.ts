import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateContractDto) {
    const room = await this.prisma.room.findFirst({
      where: { id: dto.roomId, property: { ownerId: userId } },
    });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');

    return this.prisma.contract.create({
      data: {
        roomId: dto.roomId,
        tenantId: dto.tenantId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        depositAmount: dto.depositAmount ?? 0,
        depositStatus: dto.depositStatus ?? 'PENDING',
        terms: dto.terms,
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.contract.findMany({
      where: { room: { propertyId } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
    if (!contract) throw new NotFoundException('Không tìm thấy hợp đồng');
    return contract;
  }

  async update(userId: string, id: string, dto: UpdateContractDto) {
    await this.findOne(userId, id);
    return this.prisma.contract.update({
      where: { id },
      data: {
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        depositAmount: dto.depositAmount,
        depositStatus: dto.depositStatus,
        terms: dto.terms,
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.contract.delete({ where: { id } });
  }

  async getExpiringContracts(daysAhead: number) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + daysAhead);

    return this.prisma.contract.findMany({
      where: { endDate: { gte: from, lte: to } },
      include: {
        room: { include: { property: { select: { id: true, ownerId: true, name: true } } } },
        tenant: { select: { name: true } },
      },
    });
  }
}
