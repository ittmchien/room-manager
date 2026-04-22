'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, ErrorBlock, List, Skeleton, Dialog } from 'antd-mobile';
import { useExpenses, useDeleteExpense } from '@/hooks/use-expenses';
import { useProperty } from '@/contexts/property-context';
import { ExpenseFormModal } from '@/components/expenses/expense-form-modal';

const CATEGORY_LABEL: Record<string, string> = {
  repair: 'Sửa chữa',
  maintenance: 'Bảo trì',
  utility: 'Điện nước',
  other: 'Khác',
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function ExpensesPage() {
  const { propertyId } = useProperty();
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: expenses, isLoading } = useExpenses(propertyId, month);
  const deleteExpense = useDeleteExpense();

  const totalExpense = expenses?.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0) ?? 0;
  const totalIncome = expenses?.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0) ?? 0;

  const handleDelete = async (id: string, note: string | null) => {
    const confirmed = await Dialog.confirm({
      content: `Xoá khoản "${note ?? 'này'}"?`,
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
    });
    if (!confirmed) return;
    deleteExpense.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thu / Chi</h1>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-0.5 text-sm text-gray-400 bg-transparent outline-none"
          />
        </div>
        {propertyId && (
          <ExpenseFormModal
            propertyId={propertyId}
            trigger={
              <Button size="small" color="primary" className="!rounded-[20px]">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm
              </Button>
            }
          />
        )}
      </div>

      {expenses && expenses.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-xs text-red-400">Chi phí</p>
            <p className="mt-1 text-lg font-bold text-red-600">
              {totalExpense.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 p-4">
            <p className="text-xs text-green-500">Thu khác</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {totalIncome.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-1/2" />
              <Skeleton.Paragraph lineCount={1} animated />
            </div>
          ))}
        </div>
      ) : !propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : expenses?.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có khoản thu/chi nào" />
      ) : (
        <List className="[--border-top:none] [--border-bottom:none]">
          {expenses?.map((e) => (
            <List.Item
              key={e.id}
              description={`${CATEGORY_LABEL[e.category] ?? e.category} · ${new Date(e.date).toLocaleDateString('vi-VN')}${e.room ? ` · ${e.room.name}` : ''}`}
              extra={
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${e.type === 'EXPENSE' ? 'text-red-500' : 'text-green-600'}`}>
                    {e.type === 'EXPENSE' ? '-' : '+'}{e.amount.toLocaleString('vi-VN')}đ
                  </span>
                  <Button
                    fill="none"
                    onClick={() => handleDelete(e.id, e.note)}
                    className="!text-red-400 !p-1 !min-w-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              {e.note ?? '—'}
            </List.Item>
          ))}
        </List>
      )}
    </div>
  );
}
