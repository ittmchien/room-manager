'use client';

import { useRouter } from 'next/navigation';
import { Invoice } from '@/hooks/use-invoices';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PAID: { label: 'Đã thu', badge: 'bg-secondary-fixed text-on-secondary-fixed', bar: 'bg-secondary' },
  PENDING: { label: 'Chưa thu', badge: 'bg-error-container text-on-error-container', bar: 'bg-error' },
  PARTIAL: { label: 'Thu 1 phần', badge: 'bg-tertiary-fixed text-on-tertiary-fixed', bar: 'bg-tertiary-fixed-dim' },
} as const;

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [year, month] = invoice.billingPeriod.split('-');
  const cfg = statusConfig[invoice.status];
  const remaining = invoice.total - invoice.paidAmount;

  return (
    <button
      onClick={() => router.push(`/invoices/${invoice.id}`)}
      className="group flex w-full overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all hover:shadow-md active:scale-[0.99] text-left"
    >
      <div className={cn('w-1 shrink-0', cfg.bar)} />
      <div className="flex flex-1 items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-on-surface truncate">{invoice.room?.name ?? '—'}</p>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', cfg.badge)}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Tháng {month}/{year}
            {invoice.tenant?.name && ` · ${invoice.tenant.name}`}
          </p>
          <p className="mt-1.5 text-lg font-bold text-on-surface">
            {invoice.total.toLocaleString('vi-VN')}đ
          </p>
          {invoice.status !== 'PAID' && remaining > 0 && (
            <p className="text-xs text-on-surface-variant">Còn lại: {remaining.toLocaleString('vi-VN')}đ</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-outline transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
