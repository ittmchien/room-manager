import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: Record<string, jest.Mock> };

  beforeEach(async () => {
    prisma = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('upsertFromSupabase', () => {
    it('should create user on first login', async () => {
      const supabaseUser = {
        id: 'sup-123',
        email: 'test@test.com',
        phone: undefined,
      };
      const expectedUser = {
        id: 'db-1',
        supabaseUserId: 'sup-123',
        email: 'test@test.com',
        phone: null,
        name: 'test',
      };
      prisma.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.upsertFromSupabase(supabaseUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { supabaseUserId: 'sup-123' },
        create: {
          supabaseUserId: 'sup-123',
          email: 'test@test.com',
          phone: null,
          name: 'test',
        },
        update: {
          email: 'test@test.com',
          phone: null,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should derive name from phone when no email', async () => {
      const supabaseUser = {
        id: 'sup-456',
        email: undefined,
        phone: '+84901234567',
      };
      const expectedUser = {
        id: 'db-2',
        supabaseUserId: 'sup-456',
        email: null,
        phone: '+84901234567',
        name: '+84901234567',
      };
      prisma.user.upsert.mockResolvedValue(expectedUser);

      const result = await service.upsertFromSupabase(supabaseUser);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ name: '+84901234567' }),
        }),
      );
      expect(result).toEqual(expectedUser);
    });
  });
});
