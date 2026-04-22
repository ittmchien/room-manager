import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ContractsService } from '../contracts/contracts.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
    private notificationsService: NotificationsService,
    private contractsService: ContractsService,
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

  /** Daily at 09:00 — find overdue invoices and send push notifications */
  @Cron('0 9 * * *')
  async checkOverdueInvoices() {
    this.logger.log('Checking overdue invoices...');

    const overdue = await this.getOverdueInvoices();
    this.logger.log(`Found ${overdue.length} overdue invoices`);

    // Group by owner and send one push per owner
    const byOwner = new Map<string, typeof overdue>();
    for (const inv of overdue) {
      const ownerId = inv.room.property.ownerId;
      if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
      byOwner.get(ownerId)!.push(inv);
    }

    for (const [ownerId, invoices] of byOwner) {
      const count = invoices.length;
      await this.notificationsService.sendToUser(ownerId, {
        title: 'Nhắc thanh toán',
        body: `Có ${count} hóa đơn chưa thanh toán`,
        url: '/invoices',
      });
    }
  }

  /** Daily at 09:30 — notify owners of contracts expiring within 30 days */
  @Cron('30 9 * * *')
  async checkExpiringContracts() {
    this.logger.log('Checking expiring contracts...');

    const expiring = await this.contractsService.getExpiringContracts(30);

    const byOwner = new Map<string, typeof expiring>();
    for (const contract of expiring) {
      const ownerId = contract.room.property.ownerId;
      if (!byOwner.has(ownerId)) byOwner.set(ownerId, []);
      byOwner.get(ownerId)!.push(contract);
    }

    for (const [ownerId, contracts] of byOwner) {
      await this.notificationsService.sendToUser(ownerId, {
        title: 'Hợp đồng sắp hết hạn',
        body: `Có ${contracts.length} hợp đồng sắp hết hạn trong 30 ngày tới`,
        url: '/contracts',
      });
    }
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
