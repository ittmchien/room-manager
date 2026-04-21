import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    room: Record<string, jest.Mock>;
    meterReading: Record<string, jest.Mock>;
    utilityConfig: Record<string, jest.Mock>;
    serviceFee: Record<string, jest.Mock>;
    invoice: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      room: { findMany: jest.fn() },
      meterReading: { findFirst: jest.fn() },
      utilityConfig: { findFirst: jest.fn() },
      serviceFee: { findMany: jest.fn() },
      invoice: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('generate', () => {
    it('should generate invoice with FIXED rent and no utility readings', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', rentPrice: 3000000, rentCalcType: 'FIXED', rentPerPersonPrice: null, tenants: [{ id: 'tenant-1' }] },
      ]);
      prisma.meterReading.findFirst.mockResolvedValue(null);
      prisma.utilityConfig.findFirst.mockResolvedValue(null);
      prisma.serviceFee.findMany.mockResolvedValue([]);
      prisma.invoice.create.mockResolvedValue({ id: 'inv-1', total: 3000000, roomFee: 3000000, electricFee: 0, waterFee: 0, status: 'PENDING' });

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results).toHaveLength(1);
      expect(results[0].total).toBe(3000000);
      expect(prisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ roomFee: 3000000, electricFee: 0, waterFee: 0 }) }),
      );
    });

    it('should calculate electric fee from meter reading', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', rentPrice: 2000000, rentCalcType: 'FIXED', rentPerPersonPrice: null, tenants: [{ id: 'tenant-1' }] },
      ]);
      // calculateUtilityFee calls Promise.all([meterReading.findFirst, utilityConfig.findFirst]) for ELECTRIC then WATER
      prisma.meterReading.findFirst
        .mockResolvedValueOnce({ readingValue: 150, previousValue: 100 }) // ELECTRIC
        .mockResolvedValueOnce(null); // WATER
      prisma.utilityConfig.findFirst
        .mockResolvedValueOnce({ calcType: 'FIXED', unitPrice: 3500 }) // ELECTRIC
        .mockResolvedValueOnce(null); // WATER
      prisma.serviceFee.findMany.mockResolvedValue([]);
      prisma.invoice.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'inv-1', ...data, status: 'PENDING' }),
      );

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results[0].electricFee).toBe(175000); // (150-100)*3500
      expect(results[0].total).toBe(2175000);
    });

    it('should skip rooms with no active tenants', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', rentPrice: 3000000, rentCalcType: 'FIXED', rentPerPersonPrice: null, tenants: [] },
      ]);
      prisma.serviceFee.findMany.mockResolvedValue([]);

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results).toHaveLength(0);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('should skip creation and return existing invoice when already generated', async () => {
      const existing = { id: 'inv-existing', total: 3000000, status: 'PENDING' };
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.room.findMany.mockResolvedValue([
        { id: 'room-1', rentPrice: 3000000, rentCalcType: 'FIXED', rentPerPersonPrice: null, tenants: [{ id: 'tenant-1' }] },
      ]);
      prisma.serviceFee.findMany.mockResolvedValue([]);
      prisma.invoice.findFirst.mockResolvedValue(existing);

      const results = await service.generate('user-1', { propertyId: 'prop-1', billingPeriod: '2026-04' });
      expect(results[0]).toEqual(existing);
      expect(prisma.invoice.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.generate('user-1', { propertyId: 'prop-99', billingPeriod: '2026-04' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should list invoices for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1', billingPeriod: '2026-04' }]);
      const result = await service.findAll('user-1', 'prop-1', '2026-04');
      expect(result).toHaveLength(1);
    });

    it('should throw if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(service.findAll('user-1', 'prop-99')).rejects.toThrow(NotFoundException);
    });
  });
});
