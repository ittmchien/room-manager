export class UpdateContractDto {
  endDate?: string;
  depositAmount?: number;
  depositStatus?: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms?: string;
}
