import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  paymentDate!: string;

  @IsEnum(PaymentMethodDto)
  method!: PaymentMethodDto;

  @IsOptional()
  @IsString()
  note?: string;
}
