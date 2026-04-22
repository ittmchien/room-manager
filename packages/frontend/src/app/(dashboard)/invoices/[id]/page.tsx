'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Skeleton, Tag } from 'antd-mobile';
import { useInvoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { PaymentFormModal } from '@/components/invoices/payment-form-modal';

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  TRANSFER: 'Chuyển khoản',
  OTHER: 'Khác',
};

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-blue-600 font-bold text-base' : ''}`}>{value}</span>
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={5} animated />
      </div>
    );
  }

  if (!invoice) return <p className="py-8 text-center text-gray-400">Không tìm thấy hóa đơn</p>;

  const [year, month] = invoice.billingPeriod.split('-');
  const remaining = invoice.total - invoice.paidAmount;
  const serviceFees = invoice.serviceFeesDetail ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{invoice.room?.name}</h1>
          <p className="text-xs text-gray-400">Tháng {month}/{year} · {invoice.tenant?.name}</p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="px-4 space-y-4">
        {/* Payment action */}
        {invoice.status !== 'PAID' && (
          <PaymentFormModal
            invoiceId={invoice.id}
            remaining={remaining}
            trigger={
              <Button block color="primary" fill="outline" className="!rounded-xl">
                Ghi nhận thanh toán
              </Button>
            }
          />
        )}

        {/* Invoice detail */}
        <Card style={{ '--border-radius': '16px' }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Chi tiết hóa đơn</p>
          <Row label="Tiền phòng" value={`${invoice.roomFee.toLocaleString('vi-VN')}đ`} />
          {invoice.electricFee > 0 && <Row label="Tiền điện" value={`${invoice.electricFee.toLocaleString('vi-VN')}đ`} />}
          {invoice.waterFee > 0 && <Row label="Tiền nước" value={`${invoice.waterFee.toLocaleString('vi-VN')}đ`} />}
          {serviceFees.map((fee) => (
            <Row key={fee.id} label={fee.name} value={`${fee.amount.toLocaleString('vi-VN')}đ`} />
          ))}
          {invoice.discount > 0 && <Row label="Giảm giá" value={`-${invoice.discount.toLocaleString('vi-VN')}đ`} />}
          <div className="mt-2 border-t border-gray-100 pt-2">
            <Row label="Tổng cộng" value={`${invoice.total.toLocaleString('vi-VN')}đ`} highlight />
          </div>
        </Card>

        {/* Payment history */}
        {invoice.payments && invoice.payments.length > 0 && (
          <Card style={{ '--border-radius': '16px' }}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Lịch sử thanh toán</p>
            {invoice.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{METHOD_LABEL[payment.method] ?? payment.method}</p>
                  <p className="text-xs text-gray-400">{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">+{payment.amount.toLocaleString('vi-VN')}đ</p>
              </div>
            ))}
            <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Đã thanh toán</span>
                <span className="text-sm font-medium">{invoice.paidAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              {remaining > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Còn lại</span>
                  <span className="text-sm font-semibold text-red-500">{remaining.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
