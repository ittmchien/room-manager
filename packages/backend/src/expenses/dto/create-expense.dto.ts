export class CreateExpenseDto {
  propertyId!: string;
  roomId?: string;
  category!: string; // e.g. 'repair', 'maintenance', 'other'
  type!: 'INCOME' | 'EXPENSE';
  amount!: number;
  date!: string; // ISO date string
  note?: string;
}
