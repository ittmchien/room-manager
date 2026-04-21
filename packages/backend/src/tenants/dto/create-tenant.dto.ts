import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MaxLength(100)
  name!: string;

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
  moveInDate!: string;
}
