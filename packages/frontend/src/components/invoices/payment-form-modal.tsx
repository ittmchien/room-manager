'use client';

import { useState } from 'react';
import { useCreatePayment } from '@/hooks/use-payments';
import { AppPopup } from '@/components/ui/app-popup';
import { FormInput } from '@/components/ui/form-field';
import { SelectorField } from '@/components/ui/selector-field';

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
        <FormInput label="Số tiền (VND)" type="number" value={amount} onChange={setAmount} />
        <SelectorField label="Hình thức" options={METHOD_OPTIONS} value={method} onChange={setMethod} />
        <FormInput label="Ghi chú (tuỳ chọn)" placeholder="Ghi chú..." value={note} onChange={setNote} />
      </div>
    </AppPopup>
  );
}
