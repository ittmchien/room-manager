import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  /** 1st of each month at 08:00 — auto-generate invoices for the current month */
  @Cron('0 8 1 * *')
  async autoGenerateInvoices() {
    this.logger.log('Running monthly invoice auto-generation...');

    const now = new Date();
    const billingPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const properties = await this.prisma.property.findMany({
      select: { id: true, ownerId: true },
    });

    for (const property of properties) {
      try {
        await this.invoicesService.generate(property.ownerId, {
          propertyId: property.id,
          billingPeriod,
        });
        this.logger.log(`Generated invoices for property ${property.id} period ${billingPeriod}`);
      } catch (err) {
        this.logger.error(`Failed to generate for property ${property.id}: ${(err as Error).message}`);
      }
    }
  }

  /** Daily at 09:00 — find overdue invoices and log them */
  @Cron('0 9 * * *')
  async checkOverdueInvoices() {
    this.logger.log('Checking overdue invoices...');

    const overdue = await this.getOverdueInvoices();
    this.logger.log(`Found ${overdue.length} overdue invoices`);
    // Push notification will be triggered here in next task
  }

  /** Expose for programmatic use */
  async getOverdueInvoices() {
    return this.prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
      include: {
        room: { include: { property: { select: { id: true, ownerId: true } } } },
        tenant: { select: { name: true } },
      },
    });
  }
}
