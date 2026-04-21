import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  PENDING: { label: 'Chưa thanh toán', className: 'bg-yellow-100 text-yellow-700' },
  PARTIAL: { label: 'Thanh toán một phần', className: 'bg-blue-100 text-blue-700' },
  PAID: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
};

export function InvoiceStatusBadge({ status }: { status: 'PENDING' | 'PARTIAL' | 'PAID' }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
