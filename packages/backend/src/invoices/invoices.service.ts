import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private getBillingPeriodRange(billingPeriod: string): { start: Date; end: Date } {
    const start = new Date(`${billingPeriod}-01T00:00:00.000Z`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  private async calculateUtilityFee(
    roomId: string,
    propertyId: string,
    type: 'ELECTRIC' | 'WATER',
    start: Date,
    end: Date,
  ): Promise<number> {
    const [reading, config] = await Promise.all([
      this.prisma.meterReading.findFirst({
        where: { roomId, type, readingDate: { gte: start, lte: end } },
        orderBy: { readingDate: 'desc' },
      }),
      this.prisma.utilityConfig.findFirst({ where: { propertyId, type } }),
    ]);
    if (!reading || !config || config.calcType !== 'FIXED' || !config.unitPrice) return 0;
    return Math.max(0, reading.readingValue - reading.previousValue) * config.unitPrice;
  }

  async generate(userId: string, dto: GenerateInvoicesDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    const { start, end } = this.getBillingPeriodRange(dto.billingPeriod);

    const rooms = await this.prisma.room.findMany({
      where: { propertyId: dto.propertyId },
      include: { tenants: { where: { status: 'ACTIVE' }, select: { id: true } } },
    });

    const occupiedRooms = rooms.filter((r) => r.tenants.length > 0);

    const serviceFees = await this.prisma.serviceFee.findMany({
      where: { propertyId: dto.propertyId, applyTo: 'ALL' },
    });

    return Promise.all(
      occupiedRooms.map(async (room) => {
        // Idempotency: skip if invoice already exists for this room+period
        const existing = await this.prisma.invoice.findFirst({
          where: { roomId: room.id, billingPeriod: dto.billingPeriod },
        });
        if (existing) return existing;

        const activeTenantCount = room.tenants.length;
        const tenantId = room.tenants[0].id;

        const roomFee =
          room.rentCalcType === 'PER_PERSON' && room.rentPerPersonPrice
            ? room.rentPerPersonPrice * activeTenantCount
            : room.rentPrice;

        const [electricFee, waterFee] = await Promise.all([
          this.calculateUtilityFee(room.id, dto.propertyId, 'ELECTRIC', start, end),
          this.calculateUtilityFee(room.id, dto.propertyId, 'WATER', start, end),
        ]);

        const serviceFeesDetail = serviceFees.map((fee) => ({
          id: fee.id,
          name: fee.name,
          amount:
            fee.calcType === 'FIXED_PER_ROOM'
              ? fee.unitPrice
              : fee.calcType === 'PER_PERSON'
                ? fee.unitPrice * activeTenantCount
                : 0,
        }));

        const total =
          roomFee +
          electricFee +
          waterFee +
          serviceFeesDetail.reduce((sum, f) => sum + f.amount, 0);

        // dueDate = 15th of the billing month
        const [periodYear, periodMonth] = dto.billingPeriod.split('-').map(Number);
        const dueDate = new Date(periodYear, periodMonth - 1, 15, 23, 59, 59, 999);

        return this.prisma.invoice.create({
          data: {
            roomId: room.id,
            tenantId,
            billingPeriod: dto.billingPeriod,
            roomFee,
            electricFee,
            waterFee,
            serviceFeesDetail,
            discount: 0,
            total,
            paidAmount: 0,
            status: 'PENDING',
            dueDate,
          },
        });
      }),
    );
  }

  async findAll(userId: string, propertyId: string, billingPeriod?: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
    });
    if (!property) throw new NotFoundException('Không tìm thấy khu trọ');

    return this.prisma.invoice.findMany({
      where: { room: { propertyId }, ...(billingPeriod ? { billingPeriod } : {}) },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
      },
      orderBy: [{ billingPeriod: 'desc' }, { room: { name: 'asc' } }],
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, room: { property: { ownerId: userId } } },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });
    if (!invoice) throw new NotFoundException('Không tìm thấy hóa đơn');
    return invoice;
  }
}
