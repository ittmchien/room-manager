import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantsService } from '../tenants.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: {
    room: Record<string, jest.Mock>;
    tenant: Record<string, jest.Mock>;
  };

  beforeEach(async () => {
    prisma = {
      room: { findFirst: jest.fn() },
      tenant: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  describe('create', () => {
    it('should create tenant for valid room', async () => {
      prisma.room.findFirst.mockResolvedValue({ id: 'room-1', property: { ownerId: 'user-1' } });
      prisma.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: 'Nguyễn Văn A',
        roomId: 'room-1',
        status: 'ACTIVE',
      });

      const result = await service.create('user-1', 'room-1', {
        name: 'Nguyễn Văn A',
        moveInDate: '2026-04-01',
      });

      expect(result.name).toBe('Nguyễn Văn A');
    });

    it('should throw NotFoundException if room not owned by user', async () => {
      prisma.room.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'room-99', { name: 'Test', moveInDate: '2026-04-01' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkout', () => {
    it('should set status to MOVED_OUT and set moveOutDate', async () => {
      prisma.tenant.findFirst.mockResolvedValue({
        id: 'tenant-1',
        roomId: 'room-1',
        room: { property: { ownerId: 'user-1' } },
      });
      prisma.tenant.update.mockResolvedValue({
        id: 'tenant-1',
        status: 'MOVED_OUT',
        moveOutDate: new Date(),
      });

      const result = await service.checkout('user-1', 'tenant-1');
      expect(prisma.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tenant-1' },
          data: expect.objectContaining({ status: 'MOVED_OUT' }),
        }),
      );
      expect(result.status).toBe('MOVED_OUT');
    });
  });
});
