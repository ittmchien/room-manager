import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsString()
  @IsNotEmpty()
  category!: string; // e.g. 'repair', 'maintenance', 'other'

  @IsIn(['INCOME', 'EXPENSE'])
  type!: 'INCOME' | 'EXPENSE';

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  date!: string; // ISO date string

  @IsOptional()
  @IsString()
  note?: string;
}
