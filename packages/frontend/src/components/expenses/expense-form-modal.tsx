'use client';

import { useState } from 'react';
import { Input, Selector } from 'antd-mobile';
import { useCreateExpense } from '@/hooks/use-expenses';
import { AppPopup } from '@/components/ui/app-popup';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const TYPE_OPTIONS = [
  { label: 'Chi phí', value: 'EXPENSE' },
  { label: 'Thu khác', value: 'INCOME' },
];

const CATEGORY_OPTIONS = [
  { label: 'Sửa chữa', value: 'repair' },
  { label: 'Bảo trì', value: 'maintenance' },
  { label: 'Điện nước', value: 'utility' },
  { label: 'Khác', value: 'other' },
];

export function ExpenseFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string[]>(['EXPENSE']);
  const [category, setCategory] = useState<string[]>(['other']);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const createExpense = useCreateExpense();

  const reset = () => {
    setType(['EXPENSE']); setCategory(['other']);
    setAmount(''); setDate(new Date().toISOString().split('T')[0]); setNote('');
  };

  const handleSubmit = () => {
    if (!amount || !date) return;
    createExpense.mutate({
      propertyId,
      category: category[0] ?? 'other',
      type: type[0] as 'INCOME' | 'EXPENSE',
      amount: Number(amount),
      date,
      note: note || undefined,
    }, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <AppPopup
      title="Thêm thu/chi"
      visible={open}
      trigger={trigger}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); reset(); }}
      onSubmit={handleSubmit}
      submitLabel="Lưu"
      submitLoading={createExpense.isPending}
      submitDisabled={!amount || !date}
      error={createExpense.error ? (createExpense.error as Error).message : null}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Loại</p>
          <Selector options={TYPE_OPTIONS} value={type} onChange={setType} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Danh mục</p>
          <Selector options={CATEGORY_OPTIONS} value={category} onChange={setCategory} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Số tiền (VNĐ) *</p>
          <Input type="number" placeholder="0" value={amount} onChange={setAmount} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Ngày</p>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent py-2.5 text-[15px] outline-none" />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Ghi chú (tuỳ chọn)</p>
          <Input placeholder="Mô tả..." value={note} onChange={setNote} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
      </div>
    </AppPopup>
  );
}
