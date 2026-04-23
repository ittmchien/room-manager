import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './dto/create-tag.dto';

@Injectable()
export class AdminTagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tags = await this.prisma.tag.findMany({ orderBy: { name: 'asc' } });

    const tagCounts = await Promise.all(
      tags.map(async (tag) => {
        const count = await this.prisma.user.count({
          where: { tags: { has: tag.name } },
        });
        return { ...tag, userCount: count };
      }),
    );

    return tagCounts;
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Tag already exists');

    return this.prisma.tag.create({ data: dto });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    if (dto.name && dto.name !== tag.name) {
      const users = await this.prisma.user.findMany({ where: { tags: { has: tag.name } } });
      for (const user of users) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { tags: user.tags.map((t) => (t === tag.name ? dto.name! : t)) },
        });
      }
    }

    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');

    const users = await this.prisma.user.findMany({ where: { tags: { has: tag.name } } });
    for (const user of users) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { tags: user.tags.filter((t) => t !== tag.name) },
      });
    }

    return this.prisma.tag.delete({ where: { id } });
  }

  async bulkAssign(tagId: string, userIds: string[]) {
    const tag = await this.prisma.tag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundException('Tag not found');

    let assignedCount = 0;
    for (const userId of userIds) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user && !user.tags.includes(tag.name)) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { tags: [...user.tags, tag.name] },
        });
        assignedCount++;
      }
    }

    return { assignedCount };
  }
}
