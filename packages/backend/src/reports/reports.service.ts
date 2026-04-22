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

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const [allInvoices, allExpenses] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { room: { propertyId }, billingPeriod: { startsWith: `${year}-` } },
        select: { billingPeriod: true, total: true, paidAmount: true, status: true },
      }),
      this.prisma.expense.findMany({
        where: { propertyId, date: { gte: yearStart, lt: yearEnd } },
        select: { amount: true, type: true, date: true },
      }),
    ]);

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const billingPeriod = `${year}-${String(month).padStart(2, '0')}`;
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 1);

      const invoices = allInvoices.filter((inv) => inv.billingPeriod === billingPeriod);
      const expenses = allExpenses.filter((e) => {
        const d = new Date(e.date);
        return d >= monthStart && d < monthEnd;
      });

      const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
      const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
      const totalExpenses = expenses.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
      const totalOtherIncome = expenses.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);

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
    });
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
