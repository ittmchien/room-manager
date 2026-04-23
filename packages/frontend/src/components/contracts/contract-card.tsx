'use client';

import { AlertTriangle } from 'lucide-react';
import { Contract } from '@/hooks/use-contracts';
import { StatusBadge } from '@/components/ui/status-badge';

const DEPOSIT_STATUS_MAP: Record<Contract['depositStatus'], { label: string; className: string }> = {
  PENDING:  { label: 'Chưa cọc',  className: 'bg-amber-50 text-amber-700' },
  PAID:     { label: 'Đã cọc',    className: 'bg-emerald-50 text-emerald-700' },
  RETURNED: { label: 'Đã trả',    className: 'bg-gray-100 text-gray-600' },
  DEDUCTED: { label: 'Khấu trừ', className: 'bg-red-50 text-red-600' },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function getDaysLeft(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface Props {
  contract: Contract;
}

export function ContractCard({ contract }: Props) {
  const deposit = DEPOSIT_STATUS_MAP[contract.depositStatus];
  const daysLeft = getDaysLeft(contract.endDate);

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm shadow-blue-100/30 text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{contract.room?.name ?? '—'}</p>
          <p className="text-sm text-gray-500 truncate">{contract.tenant?.name ?? '—'}</p>
          <p className="mt-1 text-xs text-gray-400">
            {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge label={deposit.label} className={deposit.className} />
          {contract.depositAmount > 0 && (
            <p className="text-xs text-gray-500">
              Cọc: {contract.depositAmount.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>
      {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Còn {daysLeft} ngày hết hạn
        </div>
      )}
      {daysLeft !== null && daysLeft <= 0 && (
        <p className="mt-2 text-xs font-medium text-red-500">Đã hết hạn</p>
      )}
    </div>
  );
}
