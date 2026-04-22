import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateContractDto {
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
