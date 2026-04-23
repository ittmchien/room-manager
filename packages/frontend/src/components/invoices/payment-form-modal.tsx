'use client';

import { useState } from 'react';
import { Input, Selector } from 'antd-mobile';
import { useCreatePayment } from '@/hooks/use-payments';
import { AppPopup } from '@/components/ui/app-popup';

interface Props {
  invoiceId: string;
  remaining: number;
  trigger: React.ReactNode;
}

const METHOD_OPTIONS = [
  { label: 'Tiền mặt', value: 'CASH' },
  { label: 'Chuyển khoản', value: 'TRANSFER' },
  { label: 'Khác', value: 'OTHER' },
];

export function PaymentFormModal({ invoiceId, remaining, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining.toString());
  const [method, setMethod] = useState<string[]>(['CASH']);
  const [note, setNote] = useState('');
  const createPayment = useCreatePayment(invoiceId);

  const handleSubmit = async () => {
    try {
      await createPayment.mutateAsync({
        amount: parseInt(amount),
        paymentDate: new Date().toISOString().split('T')[0],
        method: method[0] ?? 'CASH',
        note: note || undefined,
      });
      setOpen(false);
    } catch {}
  };

  return (
    <AppPopup
      title="Ghi nhận thanh toán"
      visible={open}
      trigger={trigger}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onSubmit={handleSubmit}
      submitLabel="Ghi nhận"
      submitLoading={createPayment.isPending}
      error={createPayment.error ? (createPayment.error as Error).message : null}
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Số tiền (VND)</p>
          <Input type="number" value={amount} onChange={setAmount} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Hình thức</p>
          <Selector options={METHOD_OPTIONS} value={method} onChange={setMethod} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Ghi chú (tuỳ chọn)</p>
          <Input placeholder="Ghi chú..." value={note} onChange={setNote} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
      </div>
    </AppPopup>
  );
}
