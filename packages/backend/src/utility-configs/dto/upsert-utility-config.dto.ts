import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum UtilityCalcTypeDto {
  FIXED = 'FIXED',
  TIERED = 'TIERED',
  PER_PERSON = 'PER_PERSON',
  FIXED_PER_ROOM = 'FIXED_PER_ROOM',
}

export class UpsertUtilityConfigDto {
  @IsEnum(UtilityCalcTypeDto)
  calcType!: UtilityCalcTypeDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  perPersonPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fixedRoomPrice?: number;
}
