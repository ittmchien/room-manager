'use client';

import { useState } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreatePayment } from '@/hooks/use-payments';

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
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => setOpen(false)}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Ghi nhận thanh toán</h3>
            <Button fill="none" size="small" onClick={() => setOpen(false)} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Số tiền (VND)</p>
              <Input
                type="number"
                value={amount}
                onChange={setAmount}
                className="[--font-size:15px]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Hình thức</p>
              <Selector
                options={METHOD_OPTIONS}
                value={method}
                onChange={setMethod}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ghi chú (tuỳ chọn)</p>
              <Input
                placeholder="Ghi chú..."
                value={note}
                onChange={setNote}
                className="[--font-size:15px]"
              />
            </div>
          </div>

          {createPayment.error && (
            <p className="mt-3 text-sm text-red-500">{(createPayment.error as Error).message}</p>
          )}

          <Button
            block
            color="primary"
            size="large"
            className="mt-5 rounded-xl!"
            loading={createPayment.isPending}
            onClick={handleSubmit}
          >
            Ghi nhận
          </Button>
        </div>
      </Popup>
    </>
  );
}
