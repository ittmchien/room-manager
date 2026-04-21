import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { RentCalcType } from './create-room.dto';

export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsInt()
  @IsOptional()
  floor?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPrice?: number;

  @IsEnum(RentCalcType)
  @IsOptional()
  rentCalcType?: RentCalcType;

  @IsInt()
  @Min(0)
  @IsOptional()
  rentPerPersonPrice?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;
}
