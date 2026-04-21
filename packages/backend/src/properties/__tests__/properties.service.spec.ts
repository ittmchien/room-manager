import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: Record<string, jest.Mock>;
    userFeature: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      property: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userFeature: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe('create', () => {
    it('should create first property on free tier', async () => {
      prisma.property.count.mockResolvedValue(0);
      prisma.property.create.mockResolvedValue({
        id: 'prop-1',
        ownerId: 'user-1',
        name: 'Nhà trọ A',
        address: null,
      });

      const result = await service.create('user-1', { name: 'Nhà trọ A' });

      expect(prisma.property.count).toHaveBeenCalledWith({ where: { ownerId: 'user-1' } });
      expect(result.name).toBe('Nhà trọ A');
    });

    it('should throw ForbiddenException when free user tries to add second property', async () => {
      prisma.property.count.mockResolvedValue(1);
      prisma.userFeature.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', { name: 'Nhà trọ B' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow second property if user has MULTI_PROPERTY feature', async () => {
      prisma.property.count.mockResolvedValue(1);
      prisma.userFeature.findUnique.mockResolvedValue({ featureKey: 'multi_property' });
      prisma.property.create.mockResolvedValue({
        id: 'prop-2',
        ownerId: 'user-1',
        name: 'Nhà trọ B',
        address: null,
      });

      const result = await service.create('user-1', { name: 'Nhà trọ B' });
      expect(result.name).toBe('Nhà trọ B');
    });
  });

  describe('findAll', () => {
    it('should return properties for user', async () => {
      prisma.property.findMany.mockResolvedValue([
        { id: 'prop-1', name: 'Nhà trọ A', ownerId: 'user-1' },
      ]);

      const result = await service.findAll('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.property.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        include: { _count: { select: { rooms: true } } },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if property not owned by user', async () => {
      prisma.property.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-1', 'prop-99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update property fields', async () => {
      prisma.property.findFirst.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1', name: 'Old', address: null });
      prisma.property.update.mockResolvedValue({ id: 'prop-1', ownerId: 'user-1', name: 'New Name', address: null });

      const result = await service.update('user-1', 'prop-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(prisma.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { name: 'New Name', address: undefined },
      });
    });
  });
});
