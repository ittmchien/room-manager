import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserFeaturesService {
  constructor(private prisma: PrismaService) {}

  async getActiveFeatures(userId: string): Promise<string[]> {
    const features = await this.prisma.userFeature.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { featureKey: true },
    });
    return features.map((f) => f.featureKey);
  }
}
