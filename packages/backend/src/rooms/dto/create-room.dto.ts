import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum RentCalcType {
  FIXED = 'FIXED',
  PER_PERSON = 'PER_PERSON',
}

export class CreateRoomDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsInt()
  @Min(0)
  rentPrice!: number;

  @IsEnum(RentCalcType)
  @IsOptional()
  rentCalcType?: RentCalcType;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPerPersonPrice?: number;
}
