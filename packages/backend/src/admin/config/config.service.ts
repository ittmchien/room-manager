import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfigService implements OnModuleInit {
  private cache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadAll();
  }

  private async loadAll() {
    const configs = await this.prisma.systemConfig.findMany();
    this.cache.clear();
    for (const config of configs) {
      this.cache.set(config.key, config.value);
    }
  }

  get(key: string, fallback?: string): string {
    return this.cache.get(key) ?? fallback ?? '';
  }

  getNumber(key: string, fallback = 0): number {
    const val = this.cache.get(key);
    return val !== undefined ? Number(val) : fallback;
  }

  getBoolean(key: string, fallback = false): boolean {
    const val = this.cache.get(key);
    return val !== undefined ? val === 'true' : fallback;
  }

  async getAll() {
    const configs = await this.prisma.systemConfig.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    const grouped: Record<string, typeof configs> = {};
    for (const config of configs) {
      if (!grouped[config.group]) grouped[config.group] = [];
      grouped[config.group].push(config);
    }
    return grouped;
  }

  async update(updates: { key: string; value: string }[], updatedBy: string) {
    const results = [];
    for (const { key, value } of updates) {
      const updated = await this.prisma.systemConfig.update({
        where: { key },
        data: { value, updatedBy },
      });
      this.cache.set(key, value);
      results.push(updated);
    }
    return results;
  }
}
