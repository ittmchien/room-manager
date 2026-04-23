import { Test } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let prisma: { systemConfig: { findMany: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      systemConfig: {
        findMany: jest.fn().mockResolvedValue([
          { key: 'free_room_limit', value: '10', type: 'NUMBER', group: 'limits', description: '' },
          { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN', group: 'app', description: '' },
        ]),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ key: where.key, value: data.value }),
        ),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ConfigService);
    await service.onModuleInit();
  });

  it('should return cached string value', () => {
    expect(service.get('free_room_limit')).toBe('10');
  });

  it('should return fallback for missing key', () => {
    expect(service.get('nonexistent', 'default')).toBe('default');
  });

  it('should return number value', () => {
    expect(service.getNumber('free_room_limit')).toBe(10);
  });

  it('should return boolean value', () => {
    expect(service.getBoolean('maintenance_mode')).toBe(false);
  });

  it('should update value and refresh cache', async () => {
    await service.update([{ key: 'free_room_limit', value: '20' }], 'admin-id');
    expect(service.getNumber('free_room_limit')).toBe(20);
    expect(prisma.systemConfig.update).toHaveBeenCalledWith({
      where: { key: 'free_room_limit' },
      data: { value: '20', updatedBy: 'admin-id' },
    });
  });
});
