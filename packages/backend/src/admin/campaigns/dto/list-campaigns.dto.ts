import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { CampaignType } from '@prisma/client';

export class ListCampaignsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
