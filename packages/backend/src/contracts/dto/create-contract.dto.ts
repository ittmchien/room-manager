import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'RETURNED', 'DEDUCTED'])
  depositStatus?: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';

  @IsOptional()
  @IsString()
  terms?: string;
}
