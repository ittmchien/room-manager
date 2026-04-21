import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceFeesService } from '../service-fees.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ServiceFeesService', () => {
  let service: ServiceFeesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    serviceFee: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      serviceFee: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceFeesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<ServiceFeesService>(ServiceFeesService);
  });

  describe('create', () => {
    it('should create service fee for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.serviceFee.create.mockResolvedValue({
        id: 'fee-1', name: 'Phí vệ sinh', calcType: 'FIXED_PER_ROOM', unitPrice: 50000,
      });
      const result = await service.create('user-1', 'prop-1', {
        name: 'Phí vệ sinh', calcType: 'FIXED_PER_ROOM' as any, unitPrice: 50000, applyTo: 'ALL' as any,
      });
      expect(result.name).toBe('Phí vệ sinh');
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'prop-99', { name: 'Test', calcType: 'FIXED_PER_ROOM' as any, unitPrice: 0, applyTo: 'ALL' as any }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete owned service fee', async () => {
      prisma.serviceFee.findFirst.mockResolvedValue({ id: 'fee-1' });
      prisma.serviceFee.delete.mockResolvedValue({ id: 'fee-1' });
      const result = await service.remove('user-1', 'fee-1');
      expect(result.id).toBe('fee-1');
    });

    it('should throw NotFoundException if fee not found', async () => {
      prisma.serviceFee.findFirst.mockResolvedValue(null);
      await expect(service.remove('user-1', 'fee-99')).rejects.toThrow(NotFoundException);
    });
  });
});
