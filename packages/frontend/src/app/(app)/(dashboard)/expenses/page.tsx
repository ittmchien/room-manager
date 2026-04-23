'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, ErrorBlock, List, Skeleton, Dialog } from 'antd-mobile';
import { useExpenses, useDeleteExpense } from '@/hooks/use-expenses';
import { useProperty } from '@/contexts/property-context';
import { ExpenseFormModal } from '@/components/expenses/expense-form-modal';
import { cn } from '@/lib/utils';
import { FeatureGate } from '@/components/ui/feature-gate';
import { useSubscription } from '@/hooks/use-subscription';

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

function ExpenseBody({ propertyId, month }: { propertyId: string; month: string }) {
  const { data: expenses, isPending } = useExpenses(propertyId, month);
  const deleteExpense = useDeleteExpense();

  const handleDelete = async (id: string, note: string | null) => {
    const confirmed = await Dialog.confirm({
      content: `Xoá khoản "${note ?? 'này'}"?`,
      confirmText: 'Xoá',
      cancelText: 'Huỷ',
    });
    if (!confirmed) return;
    deleteExpense.mutate(id);
  };

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
            <Skeleton.Title animated className="w-1/2" />
            <Skeleton.Paragraph lineCount={1} animated />
          </div>
        ))}
      </div>
    );
  }

  if (!expenses?.length) {
    return <ErrorBlock status="empty" description="Chưa có khoản thu/chi nào" />;
  }

  const totalExpense = expenses.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Card className="!bg-error-container">
          <p className="text-xs text-on-error-container/70">Chi phí</p>
          <p className="mt-1 text-lg font-bold text-on-error-container">{totalExpense.toLocaleString('vi-VN')}đ</p>
        </Card>
        <Card className="!bg-green-50">
          <p className="text-xs text-green-500">Thu khác</p>
          <p className="mt-1 text-lg font-bold text-green-600">{totalIncome.toLocaleString('vi-VN')}đ</p>
        </Card>
      </div>

      <List className="no-border">
        {expenses.map((e) => (
          <List.Item
            key={e.id}
            description={`${CATEGORY_LABEL[e.category] ?? e.category} · ${new Date(e.date).toLocaleDateString('vi-VN')}${e.room ? ` · ${e.room.name}` : ''}`}
            extra={
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold', e.type === 'EXPENSE' ? 'text-error' : 'text-secondary')}>
                  {e.type === 'EXPENSE' ? '-' : '+'}{e.amount.toLocaleString('vi-VN')}đ
                </span>
                <Button fill="none" onClick={() => handleDelete(e.id, e.note)} className="!text-error !p-2 !min-w-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            }
          >
            {e.note ?? '—'}
          </List.Item>
        ))}
      </List>
    </>
  );
}

export default function ExpensesPage() {
  const { propertyId } = useProperty();
  const [month, setMonth] = useState(getCurrentMonth());
  const { canExpenses } = useSubscription();

  return (
    <FeatureGate locked={!canExpenses} description="Ghi nhận thu/chi cần mua tính năng Quản lý chi phí.">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Thu / Chi</h1>
          <div className="mt-0.5 flex items-center gap-1">
            <button
              onClick={() => {
                const [y, m] = month.split('-').map(Number);
                const d = new Date(y, m - 2);
                setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[80px] text-center text-sm font-medium text-on-surface-variant">
              Tháng {month.split('-')[1]}/{month.split('-')[0]}
            </span>
            <button
              onClick={() => {
                const [y, m] = month.split('-').map(Number);
                const d = new Date(y, m);
                setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {propertyId && (
          <ExpenseFormModal
            propertyId={propertyId}
            trigger={
              <Button size="small" color="primary">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm
              </Button>
            }
          />
        )}
      </div>

      {!propertyId
        ? <ErrorBlock status="empty" description="Chưa có khu trọ" />
        : <ExpenseBody propertyId={propertyId} month={month} />
      }
    </div>
    </FeatureGate>
  );
}
