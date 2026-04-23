import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GrantFeaturesDto {
  @IsString({ each: true })
  userIds!: string[];

  @IsString({ each: true })
  featureKeys!: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
