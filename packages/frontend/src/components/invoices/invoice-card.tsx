import Link from 'next/link';
import { Invoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from './invoice-status-badge';

export function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const [year, month] = invoice.billingPeriod.split('-');
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{invoice.room?.name ?? '—'}</p>
            <p className="text-xs text-gray-500">
              Tháng {month}/{year} · {invoice.tenant?.name ?? '—'}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Tổng: <span className="font-semibold text-gray-900">{invoice.total.toLocaleString('vi-VN')}đ</span>
          </p>
          {invoice.status !== 'PAID' && (
            <p className="text-xs text-gray-500">
              Còn lại: {(invoice.total - invoice.paidAmount).toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
