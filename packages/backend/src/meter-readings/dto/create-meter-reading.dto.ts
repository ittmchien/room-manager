import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

export enum UtilityTypeDto {
  ELECTRIC = 'ELECTRIC',
  WATER = 'WATER',
}

export class CreateMeterReadingDto {
  @IsEnum(UtilityTypeDto)
  type!: UtilityTypeDto;

  @IsInt()
  @Min(0)
  readingValue!: number;

  @IsInt()
  @Min(0)
  previousValue!: number;

  @IsDateString()
  @IsNotEmpty()
  readingDate!: string;
}
