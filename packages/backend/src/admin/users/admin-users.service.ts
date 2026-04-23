import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: ListUsersDto) {
    const { search, role, tag, page = 1, limit = 20 } = dto;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          tags: true,
          createdAt: true,
          _count: { select: { properties: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            address: true,
            _count: { select: { rooms: true } },
          },
        },
        userFeatures: true,
        subscriptions: { orderBy: { currentPeriodEnd: 'desc' } },
        purchaseHistory: { orderBy: { purchasedAt: 'desc' } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserRole: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can promote to SUPER_ADMIN');
    }

    if (user.role === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify SUPER_ADMIN');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role && { role: dto.role as any }),
      },
    });
  }

  async assignTags(userId: string, tags: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const merged = [...new Set([...user.tags, ...tags])];
    return this.prisma.user.update({
      where: { id: userId },
      data: { tags: merged },
    });
  }

  async removeTag(userId: string, tag: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { tags: user.tags.filter((t) => t !== tag) },
    });
  }
}
