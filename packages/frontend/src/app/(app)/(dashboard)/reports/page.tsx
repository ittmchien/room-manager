'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, ErrorBlock, Skeleton } from 'antd-mobile';
import { useMonthlyReport, usePropertySnapshot } from '@/hooks/use-reports';
import { useProperty } from '@/contexts/property-context';
import { FeatureGate } from '@/components/ui/feature-gate';
import { useSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function formatPrice(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return `${amount}`;
}

function BarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const CHART_HEIGHT = 120;

  return (
    <svg
      viewBox={`0 0 ${data.length * 10} ${CHART_HEIGHT + 20}`}
      className="w-full"
      role="img"
      aria-label="Biểu đồ thu chi theo tháng"
    >
      {data.map((d, i) => {
        const incomeH = Math.max((d.income / maxVal) * CHART_HEIGHT, 1);
        const expenseH = Math.max((d.expense / maxVal) * CHART_HEIGHT, 1);
        const groupX = i * 10 + 1;

        return (
          <g key={d.label}>
            <rect
              x={groupX}
              y={CHART_HEIGHT - incomeH}
              width={4}
              height={incomeH}
              rx={1}
              className="fill-primary"
            />
            <rect
              x={groupX + 5}
              y={CHART_HEIGHT - expenseH}
              width={4}
              height={expenseH}
              rx={1}
              className="fill-rose-400"
            />
            <text
              x={groupX + 4}
              y={CHART_HEIGHT + 14}
              textAnchor="middle"
              className="fill-on-surface-variant"
              fontSize={3.5}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MonthlySection({ propertyId, year }: { propertyId: string; year: number }) {
  const { data: monthly, isPending } = useMonthlyReport(propertyId, year);

  if (isPending) {
    return (
      <Card>
        <Skeleton.Paragraph lineCount={4} animated />
      </Card>
    );
  }

  if (!monthly) return null;

  const chartData = monthly.map((m, i) => ({
    label: MONTH_LABELS[i],
    income: m.totalCollected + m.totalOtherIncome,
    expense: m.totalExpenses,
  }));

  const yearTotal = monthly.reduce(
    (acc, m) => ({
      collected: acc.collected + m.totalCollected,
      expenses: acc.expenses + m.totalExpenses,
      profit: acc.profit + m.profit,
    }),
    { collected: 0, expenses: 0, profit: 0 },
  );

  return (
    <>
      <Card>
        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs text-on-surface-variant">Thu</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="text-xs text-on-surface-variant">Chi</span>
          </div>
        </div>
        <BarChart data={chartData} />
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
            <span className="text-sm text-on-surface-variant">Tổng thu</span>
            <span className="font-semibold text-primary">{yearTotal.collected.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
            <span className="text-sm text-on-surface-variant">Tổng chi</span>
            <span className="font-semibold text-error">{yearTotal.expenses.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex items-center justify-between py-2 rounded-xl bg-primary-fixed px-3">
            <span className="text-sm font-semibold text-primary">Lợi nhuận</span>
            <span className={cn('font-bold', yearTotal.profit >= 0 ? 'text-primary' : 'text-error')}>
              {yearTotal.profit >= 0 ? '+' : ''}{yearTotal.profit.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="grid grid-cols-4 border-b border-outline-variant/15 px-4 py-2 text-xs font-semibold text-on-surface-variant">
          <span>Tháng</span>
          <span className="text-right">Thu</span>
          <span className="text-right">Chi</span>
          <span className="text-right">Lãi</span>
        </div>
        {monthly.map((m) => (
          <div key={m.month} className="grid grid-cols-4 border-b border-outline-variant/15 px-4 py-2.5 text-sm last:border-0">
            <span className="text-on-surface-variant">{m.month.slice(5)}</span>
            <span className="text-right text-primary">{formatPrice(m.totalCollected)}</span>
            <span className="text-right text-rose-400">{formatPrice(m.totalExpenses)}</span>
            <span className={cn('text-right font-medium', m.profit >= 0 ? 'text-secondary' : 'text-error')}>
              {m.profit >= 0 ? '+' : ''}{formatPrice(m.profit)}
            </span>
          </div>
        ))}
      </Card>
    </>
  );
}

export default function ReportsPage() {
  const { propertyId } = useProperty();
  const [year, setYear] = useState(new Date().getFullYear());
  const { canReports } = useSubscription();

  const { data: snapshot } = usePropertySnapshot(propertyId);

  return (
    <FeatureGate locked={!canReports} description="Xem báo cáo tài chính cần mua tính năng Báo cáo.">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-surface">Báo cáo</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label="Năm trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[48px] text-center text-sm font-semibold text-on-surface">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            aria-label="Năm sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : (
        <>
          {snapshot && (
            <div className="grid grid-cols-3 gap-2">
              <Card className="text-center">
                <p className="text-2xl font-bold text-on-surface">{snapshot.occupiedRooms}</p>
                <p className="text-xs text-on-surface-variant">Đang thuê</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-primary">{formatPrice(snapshot.totalCollectedThisMonth)}</p>
                <p className="text-xs text-on-surface-variant">Thu tháng này</p>
              </Card>
              <Card className="text-center">
                <p className="text-2xl font-bold text-tertiary">{snapshot.pendingCount}</p>
                <p className="text-xs text-on-surface-variant">Chưa trả</p>
              </Card>
            </div>
          )}
          <MonthlySection propertyId={propertyId} year={year} />
        </>
      )}
    </div>
    </FeatureGate>
  );
}
