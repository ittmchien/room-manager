'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Skeleton, ErrorBlock } from 'antd-mobile';
import { useInvoices } from '@/hooks/use-invoices';
import { useProperty } from '@/contexts/property-context';
import { InvoiceCard } from '@/components/invoices/invoice-card';
import { GenerateInvoiceModal } from '@/components/invoices/generate-invoice-modal';

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function InvoicesPage() {
  const { propertyId } = useProperty();
  const [billingPeriod] = useState(getCurrentBillingPeriod);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: invoices, isLoading } = useInvoices(propertyId, billingPeriod);

  const [year, month] = billingPeriod.split('-');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hóa đơn</h1>
          <p className="text-sm text-gray-500">Tháng {month}/{year}</p>
        </div>
        {propertyId && (
          <Button
            size="small"
            color="primary"
            className="!rounded-[20px]"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4 inline" />
            Tạo hóa đơn
          </Button>
        )}
      </div>

      {!propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-1/2" />
              <Skeleton.Paragraph lineCount={2} animated />
            </div>
          ))}
        </div>
      ) : invoices?.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có hóa đơn. Bấm 'Tạo hóa đơn' để bắt đầu." />
      ) : (
        <div className="space-y-3">
          {invoices?.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
        </div>
      )}

      <GenerateInvoiceModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        propertyId={propertyId}
      />
    </div>
  );
}
