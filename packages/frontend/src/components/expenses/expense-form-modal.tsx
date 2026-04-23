'use client';

import { useState } from 'react';
import { useCreateExpense } from '@/hooks/use-expenses';
import { AppPopup } from '@/components/ui/app-popup';
import { FormInput, FormDateInput } from '@/components/ui/form-field';
import { SelectorField } from '@/components/ui/selector-field';

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
        <SelectorField label="Loại" options={TYPE_OPTIONS} value={type} onChange={setType} />
        <SelectorField label="Danh mục" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <FormInput label="Số tiền (VNĐ) *" type="number" placeholder="0" value={amount} onChange={setAmount} />
        <FormDateInput label="Ngày" value={date} onChange={setDate} />
        <FormInput label="Ghi chú (tuỳ chọn)" placeholder="Mô tả..." value={note} onChange={setNote} />
      </div>
    </AppPopup>
  );
}
