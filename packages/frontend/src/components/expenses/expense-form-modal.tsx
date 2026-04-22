'use client';

import { useState } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreateExpense } from '@/hooks/use-expenses';

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
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => { setOpen(false); reset(); }}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thêm thu/chi</h3>
            <Button fill="none" size="small" onClick={() => { setOpen(false); reset(); }} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-gray-400">Loại</p>
              <Selector
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Danh mục</p>
              <Selector
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={setCategory}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Số tiền (VNĐ) *</p>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={setAmount}
                className="[--font-size:15px]"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ghi chú (tuỳ chọn)</p>
              <Input
                placeholder="Mô tả..."
                value={note}
                onChange={setNote}
                className="[--font-size:15px]"
              />
            </div>
          </div>

          {createExpense.error && (
            <p className="mt-3 text-sm text-red-500">{(createExpense.error as Error).message}</p>
          )}

          <Button
            block color="primary" size="large"
            className="mt-5 !rounded-xl"
            loading={createExpense.isPending}
            disabled={!amount || !date}
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </div>
      </Popup>
    </>
  );
}
