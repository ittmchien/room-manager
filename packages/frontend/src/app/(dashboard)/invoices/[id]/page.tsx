'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useInvoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { PaymentFormModal } from '@/components/invoices/payment-form-modal';
import { Button } from '@/components/ui/button';

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  OTHER: 'Khác',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (!invoice) return <p className="text-center text-gray-500">Không tìm thấy hóa đơn</p>;

  const [year, month] = invoice.billingPeriod.split('-');
  const remaining = invoice.total - invoice.paidAmount;
  const serviceFees = invoice.serviceFeesDetail ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/invoices">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{invoice.room?.name}</h1>
          <p className="text-sm text-gray-500">Tháng {month}/{year} · {invoice.tenant?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
        {invoice.status !== 'PAID' && (
          <PaymentFormModal
            invoiceId={invoice.id}
            remaining={remaining}
            trigger={<Button size="sm" variant="outline">Ghi nhận thanh toán</Button>}
          />
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Chi tiết hóa đơn</h2>
        <Row label="Tiền phòng" value={`${invoice.roomFee.toLocaleString('vi-VN')}đ`} />
        {invoice.electricFee > 0 && <Row label="Tiền điện" value={`${invoice.electricFee.toLocaleString('vi-VN')}đ`} />}
        {invoice.waterFee > 0 && <Row label="Tiền nước" value={`${invoice.waterFee.toLocaleString('vi-VN')}đ`} />}
        {serviceFees.map((fee) => (
          <Row key={fee.id} label={fee.name} value={`${fee.amount.toLocaleString('vi-VN')}đ`} />
        ))}
        {invoice.discount > 0 && <Row label="Giảm giá" value={`-${invoice.discount.toLocaleString('vi-VN')}đ`} />}
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="font-semibold">Tổng cộng</span>
          <span className="font-bold text-blue-600">{invoice.total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {invoice.payments && invoice.payments.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Lịch sử thanh toán</h2>
          {invoice.payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm">{METHOD_LABEL[payment.method] ?? payment.method}</p>
                <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <p className="text-sm font-medium text-green-600">+{payment.amount.toLocaleString('vi-VN')}đ</p>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">Đã thanh toán</span>
            <span className="font-medium">{invoice.paidAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Còn lại</span>
              <span className="font-medium text-red-600">{remaining.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
