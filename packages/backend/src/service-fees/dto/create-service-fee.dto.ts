import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum FeeCalcTypeDto {
  FIXED_PER_ROOM = 'FIXED_PER_ROOM',
  PER_PERSON = 'PER_PERSON',
  PER_QUANTITY = 'PER_QUANTITY',
}

export enum FeeApplyToDto {
  ALL = 'ALL',
  SELECTED_ROOMS = 'SELECTED_ROOMS',
}

export class CreateServiceFeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(FeeCalcTypeDto)
  calcType!: FeeCalcTypeDto;

  @IsInt()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsEnum(FeeApplyToDto)
  applyTo?: FeeApplyToDto;
}
