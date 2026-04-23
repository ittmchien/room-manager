import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePricingTierDto } from './dto/create-pricing-tier.dto';
import { UpdatePricingTierDto } from './dto/update-pricing-tier.dto';

@Injectable()
export class AdminPricingService {
  constructor(private prisma: PrismaService) {}

  async findAll(featureKey?: string) {
    const where: any = {};
    if (featureKey) where.featureKey = featureKey;
    return this.prisma.pricingTier.findMany({
      where,
      orderBy: [{ featureKey: 'asc' }, { price: 'asc' }],
    });
  }

  async findOne(id: string) {
    const tier = await this.prisma.pricingTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Pricing tier not found');
    return tier;
  }

  async create(dto: CreatePricingTierDto) {
    return this.prisma.pricingTier.create({
      data: {
        featureKey: dto.featureKey,
        tierType: dto.tierType,
        tierName: dto.tierName,
        price: dto.price,
        discountPercent: dto.discountPercent ?? 0,
        includedFeatures: dto.includedFeatures ?? [],
        slotSize: dto.slotSize,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePricingTierDto) {
    const tier = await this.prisma.pricingTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Pricing tier not found');

    return this.prisma.pricingTier.update({
      where: { id },
      data: {
        ...(dto.featureKey !== undefined && { featureKey: dto.featureKey }),
        ...(dto.tierType !== undefined && { tierType: dto.tierType }),
        ...(dto.tierName !== undefined && { tierName: dto.tierName }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
        ...(dto.includedFeatures !== undefined && { includedFeatures: dto.includedFeatures }),
        ...(dto.slotSize !== undefined && { slotSize: dto.slotSize }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    const tier = await this.prisma.pricingTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Pricing tier not found');
    await this.prisma.pricingTier.delete({ where: { id } });
    return { success: true };
  }

  // Public endpoint — only active tiers
  async findPublic() {
    return this.prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: [{ featureKey: 'asc' }, { price: 'asc' }],
    });
  }
}
