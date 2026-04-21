import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UtilityConfigsService } from '../utility-configs.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UtilityConfigsService', () => {
  let service: UtilityConfigsService;
  let prisma: {
    property: Record<string, jest.Mock>;
    utilityConfig: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: { findFirst: jest.fn() },
      utilityConfig: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilityConfigsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<UtilityConfigsService>(UtilityConfigsService);
  });

  describe('findAll', () => {
    it('should return utility configs for owned property', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.utilityConfig.findMany.mockResolvedValue([
        { id: 'cfg-1', type: 'ELECTRIC', unitPrice: 3500 },
      ]);
      const result = await service.findAll('user-1', 'prop-1');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ELECTRIC');
    });

    it('should throw NotFoundException if property not owned', async () => {
      prisma.property.findFirst.mockResolvedValue(null);
      await expect(service.findAll('user-1', 'prop-99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should upsert utility config', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1' });
      prisma.utilityConfig.upsert.mockResolvedValue({
        id: 'cfg-1', propertyId: 'prop-1', type: 'ELECTRIC', calcType: 'FIXED', unitPrice: 3500,
      });
      const result = await service.upsert('user-1', 'prop-1', 'ELECTRIC', {
        calcType: 'FIXED' as any,
        unitPrice: 3500,
      });
      expect(result.unitPrice).toBe(3500);
    });
  });
});
