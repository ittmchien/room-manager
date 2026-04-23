'use client';

import { useRouter } from 'next/navigation';
import { Invoice } from '@/hooks/use-invoices';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PAID: { label: 'Đã thu', badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  PENDING: { label: 'Chưa thu', badge: 'bg-red-50 text-red-600', bar: 'bg-red-400' },
  PARTIAL: { label: 'Thu 1 phần', badge: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400' },
} as const;

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [year, month] = invoice.billingPeriod.split('-');
  const cfg = statusConfig[invoice.status];
  const remaining = invoice.total - invoice.paidAmount;

  return (
    <button
      onClick={() => router.push(`/invoices/${invoice.id}`)}
      className="group flex w-full overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/40 transition-all hover:shadow-md active:scale-[0.99] text-left"
    >
      <div className={cn('w-1 shrink-0', cfg.bar)} />
      <div className="flex flex-1 items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900 truncate">{invoice.room?.name ?? '—'}</p>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold', cfg.badge)}>
              {cfg.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">
            Tháng {month}/{year}
            {invoice.tenant?.name && ` · ${invoice.tenant.name}`}
          </p>
          <p className="mt-1.5 text-lg font-bold text-gray-900">
            {invoice.total.toLocaleString('vi-VN')}đ
          </p>
          {invoice.status !== 'PAID' && remaining > 0 && (
            <p className="text-xs text-gray-400">Còn lại: {remaining.toLocaleString('vi-VN')}đ</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  );
}
