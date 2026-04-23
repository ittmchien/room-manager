import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListCampaignsDto } from './dto/list-campaigns.dto';

@Injectable()
export class AdminCampaignsService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: ListCampaignsDto) {
    const { search, type, isActive, page = 1, limit = 20 } = dto;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const [items, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: { _count: { select: { redemptions: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: { select: { redemptions: true } },
        redemptions: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { redeemedAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        rules: dto.rules,
        reward: dto.reward,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isActive: dto.isActive ?? true,
        maxRedemptions: dto.maxRedemptions,
      },
    });
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.rules !== undefined && { rules: dto.rules }),
        ...(dto.reward !== undefined && { reward: dto.reward }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.maxRedemptions !== undefined && { maxRedemptions: dto.maxRedemptions }),
      },
    });
  }

  async remove(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.prisma.campaign.delete({ where: { id } });
    return { success: true };
  }

  // Public: check applicable campaigns for a user
  async getApplicableCampaigns(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tags: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const campaigns = await this.prisma.campaign.findMany({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    });

    const redeemedIds = (
      await this.prisma.campaignRedemption.findMany({
        where: { userId },
        select: { campaignId: true },
      })
    ).map((r) => r.campaignId);

    const userOrder = await this.prisma.user.count({
      where: { createdAt: { lte: user.createdAt } },
    });

    return campaigns.filter((c) => {
      if (redeemedIds.includes(c.id)) return false;
      const rules = c.rules as any;
      if (rules.targetTags?.length) {
        if (!rules.targetTags.some((t: string) => user.tags.includes(t))) return false;
      }
      if (rules.signupBefore && user.createdAt >= new Date(rules.signupBefore)) return false;
      if (rules.signupAfter && user.createdAt <= new Date(rules.signupAfter)) return false;
      if (rules.userOrderMax && userOrder > rules.userOrderMax) return false;
      if (c.maxRedemptions !== null) {
        // Note: redemption count check would need additional query for exactness
        // Simplified: not filtering by maxRedemptions here for performance
      }
      return true;
    });
  }

  async redeem(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const now = new Date();
    if (!campaign.isActive || campaign.startDate > now || campaign.endDate < now) {
      throw new Error('Campaign is not active');
    }

    const existing = await this.prisma.campaignRedemption.findUnique({
      where: { campaignId_userId: { campaignId, userId } },
    });
    if (existing) throw new Error('Already redeemed');

    if (campaign.maxRedemptions !== null) {
      const count = await this.prisma.campaignRedemption.count({ where: { campaignId } });
      if (count >= campaign.maxRedemptions) throw new Error('Campaign fully redeemed');
    }

    return this.prisma.campaignRedemption.create({
      data: { campaignId, userId },
    });
  }
}
