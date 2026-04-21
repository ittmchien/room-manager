import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from '../rooms.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    property: Record<string, jest.Mock>;
    userFeature: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      property: { findFirst: jest.fn() },
      userFeature: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe('create', () => {
    it('should create room when under free limit', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([]);
      prisma.room.count.mockResolvedValue(5);
      prisma.room.create.mockResolvedValue({ id: 'room-1', name: 'P101', propertyId: 'prop-1' });

      const result = await service.create('user-1', 'prop-1', { name: 'P101', rentPrice: 2000000 });
      expect(result.name).toBe('P101');
    });

    it('should throw ForbiddenException when at free limit (10 rooms)', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([]);
      prisma.room.count.mockResolvedValue(10);

      await expect(
        service.create('user-1', 'prop-1', { name: 'P101', rentPrice: 2000000 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow 20 rooms with one rooms_slot purchase', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.userFeature.findMany.mockResolvedValue([{ featureKey: 'rooms_slot' }]);
      prisma.room.count.mockResolvedValue(10);
      prisma.room.create.mockResolvedValue({ id: 'room-11', name: 'P111', propertyId: 'prop-1' });

      const result = await service.create('user-1', 'prop-1', { name: 'P111', rentPrice: 2000000 });
      expect(result.name).toBe('P111');
    });

    it('should throw NotFoundException if property not owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'prop-99', { name: 'P101', rentPrice: 0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByProperty', () => {
    it('should return rooms for a property owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1' });
      prisma.room.findMany.mockResolvedValue([{ id: 'room-1', name: 'P101', status: 'VACANT' }]);

      const result = await service.findAllByProperty('user-1', 'prop-1');
      expect(result).toHaveLength(1);
    });
  });
});
