'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useInvoices, useGenerateInvoices } from '@/hooks/use-invoices';
import { InvoiceCard } from '@/components/invoices/invoice-card';
import { Button } from '@/components/ui/button';

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function InvoicesPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';
  const [billingPeriod] = useState(getCurrentBillingPeriod);

  const { data: invoices, isLoading } = useInvoices(propertyId, billingPeriod);
  const generate = useGenerateInvoices();

  const [year, month] = billingPeriod.split('-');

  const handleGenerate = async () => {
    try {
      await generate.mutateAsync({ propertyId, billingPeriod });
    } catch {
      // error via generate.error
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Hóa đơn</h1>
          <p className="text-sm text-gray-500">Tháng {month}/{year}</p>
        </div>
        {propertyId && (
          <Button size="sm" className="gap-1" onClick={handleGenerate} disabled={generate.isPending}>
            <Plus className="h-4 w-4" />
            {generate.isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
          </Button>
        )}
      </div>

      {generate.error && <p className="text-sm text-red-500">{(generate.error as Error).message}</p>}

      {!propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />)}
        </div>
      ) : invoices?.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-medium">Chưa có hóa đơn</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bấm &quot;Tạo hóa đơn&quot; để tạo cho tháng này.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices?.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
        </div>
      )}
    </div>
  );
}
