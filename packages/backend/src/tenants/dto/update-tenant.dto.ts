import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  MOVED_OUT = 'MOVED_OUT',
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  idCard?: string;

  @IsString()
  @IsOptional()
  idCardImage?: string;

  @IsDateString()
  @IsOptional()
  moveInDate?: string;

  @IsDateString()
  @IsOptional()
  moveOutDate?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;
}
