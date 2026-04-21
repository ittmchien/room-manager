import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { FeeCalcTypeDto, FeeApplyToDto } from './create-service-fee.dto';

export class UpdateServiceFeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(FeeCalcTypeDto)
  calcType?: FeeCalcTypeDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsEnum(FeeApplyToDto)
  applyTo?: FeeApplyToDto;
}
