import { IsString } from 'class-validator';

export class RevokeFeatureDto {
  @IsString()
  userId!: string;

  @IsString()
  featureKey!: string;
}
