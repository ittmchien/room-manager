import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { CampaignType } from '@prisma/client';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CampaignType)
  type!: CampaignType;

  @IsObject()
  rules!: {
    targetTags?: string[];
    signupBefore?: string;
    signupAfter?: string;
    userOrderMax?: number;
  };

  @IsObject()
  reward!: {
    type: 'DISCOUNT' | 'FREE_TRIAL' | 'EXTEND_SUBSCRIPTION';
    discountPercent?: number;
    featureKey?: string;
    trialDays?: number;
    days?: number;
  };

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;
}
