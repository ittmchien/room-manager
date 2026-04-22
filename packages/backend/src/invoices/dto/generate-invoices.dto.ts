import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class GenerateInvoicesDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'billingPeriod must be in YYYY-MM format' })
  billingPeriod!: string;

  @IsString()
  @IsOptional()
  roomId?: string;
}
