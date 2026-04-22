import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.expense.create({
      data: {
        propertyId: dto.propertyId,
        roomId: dto.roomId ?? null,
        category: dto.category,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        note: dto.note,
      },
      include: {
        room: { select: { id: true, name: true } },
      },
    });
  }

  async findAllByProperty(userId: string, propertyId: string, month?: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const where: Record<string, unknown> = { propertyId };
    if (month) {
      // month format: YYYY-MM
      const [year, mon] = month.split('-').map(Number);
      const from = new Date(year, mon - 1, 1);
      const to = new Date(year, mon, 1);
      where.date = { gte: from, lt: to };
    }

    return this.prisma.expense.findMany({
      where,
      include: { room: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, property: { ownerId: userId } },
    });
    if (!expense) throw new NotFoundException('Không tìm thấy khoản thu/chi');
    return this.prisma.expense.delete({ where: { id } });
  }
}
