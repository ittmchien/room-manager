import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsDateString, IsObject, Min } from 'class-validator';
import { CampaignType } from '@prisma/client';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional()
  @IsObject()
  rules?: {
    targetTags?: string[];
    signupBefore?: string;
    signupAfter?: string;
    userOrderMax?: number;
  };

  @IsOptional()
  @IsObject()
  reward?: {
    type: 'DISCOUNT' | 'FREE_TRIAL' | 'EXTEND_SUBSCRIPTION';
    discountPercent?: number;
    featureKey?: string;
    trialDays?: number;
    days?: number;
  };

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;
}
