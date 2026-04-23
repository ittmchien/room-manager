import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { PricingTierType } from '@prisma/client';

export class UpdatePricingTierDto {
  @IsOptional()
  @IsString()
  featureKey?: string;

  @IsOptional()
  @IsEnum(PricingTierType)
  tierType?: PricingTierType;

  @IsOptional()
  @IsString()
  tierName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsArray()
  includedFeatures?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  slotSize?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
