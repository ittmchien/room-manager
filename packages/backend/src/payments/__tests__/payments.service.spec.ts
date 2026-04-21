import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    invoice: Record<string, jest.Mock>;
    payment: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      invoice: { findFirst: jest.fn(), update: jest.fn() },
      payment: { create: jest.fn(), findMany: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('create', () => {
    it('should create payment and set invoice PAID when fully paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 3000000 });
      prisma.payment.findMany.mockResolvedValue([{ amount: 3000000 }]);
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PAID', paidAmount: 3000000 });

      const result = await service.create('user-1', 'inv-1', {
        amount: 3000000, paymentDate: '2026-04-20', method: 'CASH' as any,
      });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: 'PAID', paidAmount: 3000000 }),
        }),
      );
      expect(result.payment.id).toBe('pay-1');
    });

    it('should set PARTIAL when partially paid', async () => {
      prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', total: 3000000 });
      prisma.payment.create.mockResolvedValue({ id: 'pay-1', amount: 1000000 });
      prisma.payment.findMany.mockResolvedValue([{ amount: 1000000 }]);
      prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'PARTIAL', paidAmount: 1000000 });

      await service.create('user-1', 'inv-1', { amount: 1000000, paymentDate: '2026-04-20', method: 'CASH' as any });
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'PARTIAL' }) }),
      );
    });

    it('should throw NotFoundException if invoice not owned', async () => {
      prisma.invoice.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'inv-99', { amount: 100, paymentDate: '2026-04-20', method: 'CASH' as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
