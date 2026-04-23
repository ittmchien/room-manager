'use client';

import { AlertTriangle } from 'lucide-react';
import { Contract } from '@/hooks/use-contracts';
import { cn } from '@/lib/utils';

const DEPOSIT_STATUS_MAP: Record<Contract['depositStatus'], { label: string; className: string }> = {
  PENDING:  { label: 'Chưa cọc',  className: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  PAID:     { label: 'Đã cọc',    className: 'bg-secondary-fixed text-on-secondary-fixed' },
  RETURNED: { label: 'Đã trả',    className: 'bg-surface-container text-on-surface-variant' },
  DEDUCTED: { label: 'Khấu trừ', className: 'bg-error-container text-on-error-container' },
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
    <div className="w-full rounded-2xl bg-surface-container-lowest p-4 shadow-sm text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface truncate">{contract.room?.name ?? '—'}</p>
          <p className="text-sm text-on-surface-variant truncate">{contract.tenant?.name ?? '—'}</p>
          <p className="mt-1 text-xs text-on-surface-variant">
            {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', deposit.className)}>
            {deposit.label}
          </span>
          {contract.depositAmount > 0 && (
            <p className="text-xs text-on-surface-variant">
              Cọc: {contract.depositAmount.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>
      {daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-tertiary">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Còn {daysLeft} ngày hết hạn
        </div>
      )}
      {daysLeft !== null && daysLeft <= 0 && (
        <p className="mt-2 text-xs font-medium text-error">Đã hết hạn</p>
      )}
    </div>
  );
}
