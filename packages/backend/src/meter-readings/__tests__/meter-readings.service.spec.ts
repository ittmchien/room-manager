import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MeterReadingsService } from '../meter-readings.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MeterReadingsService', () => {
  let service: MeterReadingsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    meterReading: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: { findFirst: jest.fn() },
      meterReading: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeterReadingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<MeterReadingsService>(MeterReadingsService);
  });

  describe('create', () => {
    it('should create meter reading for owned room', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1' });
      prisma.meterReading.create.mockResolvedValue({
        id: 'reading-1',
        roomId: 'room-1',
        type: 'ELECTRIC',
        readingValue: 150,
        previousValue: 100,
        readingDate: new Date('2026-04-01'),
      });
      const result = await service.create('user-1', 'room-1', {
        type: 'ELECTRIC' as any,
        readingValue: 150,
        previousValue: 100,
        readingDate: '2026-04-01',
      });
      expect(result.readingValue).toBe(150);
    });

    it('should throw NotFoundException if room not owned', async () => {
      prisma.room.findFirst.mockResolvedValue(null);
      await expect(
        service.create('user-1', 'room-99', {
          type: 'ELECTRIC' as any, readingValue: 100, previousValue: 90, readingDate: '2026-04-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return readings for owned room filtered by type', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1' });
      prisma.meterReading.findMany.mockResolvedValue([
        { id: 'r-1', type: 'ELECTRIC', readingValue: 150, previousValue: 100 },
      ]);
      const result = await service.findAll('user-1', 'room-1', 'ELECTRIC');
      expect(result).toHaveLength(1);
    });
  });
});
