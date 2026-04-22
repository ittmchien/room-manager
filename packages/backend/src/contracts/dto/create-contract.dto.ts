export class CreateContractDto {
  roomId!: string;
  tenantId!: string;
  startDate!: string;
  endDate?: string;
  depositAmount?: number;
  depositStatus?: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms?: string;
}
