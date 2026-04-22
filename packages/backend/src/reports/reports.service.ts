import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlySummary(userId: string, propertyId: string, year: number) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const results = await Promise.all(
      months.map(async (month) => {
        const billingPeriod = `${year}-${String(month).padStart(2, '0')}`;
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 1);

        const [invoices, expenses] = await Promise.all([
          this.prisma.invoice.findMany({
            where: { room: { propertyId }, billingPeriod },
            select: { total: true, paidAmount: true, status: true },
          }),
          this.prisma.expense.findMany({
            where: { propertyId, date: { gte: from, lt: to } },
            select: { amount: true, type: true },
          }),
        ]);

        const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
        const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
        const totalExpenses = expenses
          .filter((e) => e.type === 'EXPENSE')
          .reduce((s, e) => s + e.amount, 0);
        const totalOtherIncome = expenses
          .filter((e) => e.type === 'INCOME')
          .reduce((s, e) => s + e.amount, 0);

        return {
          month: billingPeriod,
          totalBilled,
          totalCollected,
          totalExpenses,
          totalOtherIncome,
          profit: totalCollected + totalOtherIncome - totalExpenses,
          invoiceCount: invoices.length,
          paidCount: invoices.filter((i) => i.status === 'PAID').length,
        };
      }),
    );

    return results;
  }

  async getPropertySnapshot(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [rooms, currentInvoices] = await Promise.all([
      this.prisma.room.findMany({
        where: { propertyId },
        select: { status: true },
      }),
      this.prisma.invoice.findMany({
        where: { room: { propertyId }, billingPeriod: currentPeriod },
        select: { total: true, paidAmount: true, status: true },
      }),
    ]);

    return {
      totalRooms: rooms.length,
      occupiedRooms: rooms.filter((r) => r.status === 'OCCUPIED').length,
      vacantRooms: rooms.filter((r) => r.status === 'VACANT').length,
      currentPeriod,
      totalBilledThisMonth: currentInvoices.reduce((s, i) => s + i.total, 0),
      totalCollectedThisMonth: currentInvoices.reduce((s, i) => s + i.paidAmount, 0),
      pendingCount: currentInvoices.filter((i) => i.status !== 'PAID').length,
    };
  }
}
