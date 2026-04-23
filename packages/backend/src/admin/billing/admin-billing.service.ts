import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GrantFeaturesDto } from './dto/grant-features.dto';

@Injectable()
export class AdminBillingService {
  constructor(private prisma: PrismaService) {}

  async listSubscriptions(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { currentPeriodEnd: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listPurchases(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.purchaseHistory.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { purchasedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseHistory.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async grantFeatures(dto: GrantFeaturesDto) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    let grantedCount = 0;

    for (const userId of dto.userIds) {
      for (const featureKey of dto.featureKeys) {
        await this.prisma.userFeature.upsert({
          where: { userId_featureKey: { userId, featureKey } },
          create: { userId, featureKey, expiresAt },
          update: { expiresAt },
        });
        grantedCount++;
      }
    }

    return { grantedCount };
  }

  async revokeFeature(userId: string, featureKey: string) {
    await this.prisma.userFeature.deleteMany({
      where: { userId, featureKey },
    });
    return { success: true };
  }
}
