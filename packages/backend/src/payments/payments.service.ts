import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, invoiceId: string, dto: CreatePaymentDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, room: { property: { ownerId: userId } } },
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method,
        note: dto.note,
      },
    });

    const allPayments = await this.prisma.payment.findMany({
      where: { invoiceId },
      select: { amount: true },
    });
    const paidAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let status: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (paidAmount >= invoice.total) status = 'PAID';
    else if (paidAmount > 0) status = 'PARTIAL';

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount, status, paidDate: status === 'PAID' ? new Date() : null },
    });

    return { payment, invoice: updatedInvoice };
  }
}
