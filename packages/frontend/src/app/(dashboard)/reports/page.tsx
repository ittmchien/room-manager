'use client';

import { useState } from 'react';
import { ErrorBlock, Skeleton } from 'antd-mobile';
import { useMonthlyReport, usePropertySnapshot } from '@/hooks/use-reports';
import { useProperty } from '@/contexts/property-context';

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function formatPrice(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return `${amount}`;
}

function BarChart({ data }: { data: { label: string; income: number; expense: number }[] }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="flex items-end gap-0.5 w-full">
            <div
              className="flex-1 rounded-t bg-blue-400 min-h-[2px] transition-all"
              style={{ height: `${(d.income / maxVal) * 112}px` }}
            />
            <div
              className="flex-1 rounded-t bg-red-300 min-h-[2px] transition-all"
              style={{ height: `${(d.expense / maxVal) * 112}px` }}
            />
          </div>
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const { propertyId } = useProperty();
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: monthly, isLoading: loadingMonthly } = useMonthlyReport(propertyId, year);
  const { data: snapshot } = usePropertySnapshot(propertyId);

  const chartData = (monthly ?? []).map((m, i) => ({
    label: MONTH_LABELS[i],
    income: m.totalCollected + m.totalOtherIncome,
    expense: m.totalExpenses,
  }));

  const yearTotal = monthly?.reduce(
    (acc, m) => ({
      collected: acc.collected + m.totalCollected,
      expenses: acc.expenses + m.totalExpenses,
      profit: acc.profit + m.profit,
    }),
    { collected: 0, expenses: 0, profit: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Báo cáo</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="px-2 py-1 text-gray-400 text-lg">‹</button>
          <span className="text-sm font-semibold text-gray-700">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="px-2 py-1 text-gray-400 text-lg">›</button>
        </div>
      </div>

      {!propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : (
        <>
          {snapshot && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-gray-900">{snapshot.occupiedRooms}</p>
                <p className="text-xs text-gray-400">Đang thuê</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-blue-600">{formatPrice(snapshot.totalCollectedThisMonth)}</p>
                <p className="text-xs text-gray-400">Thu tháng này</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-amber-500">{snapshot.pendingCount}</p>
                <p className="text-xs text-gray-400">Chưa trả</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                <span className="text-xs text-gray-500">Thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="text-xs text-gray-500">Chi</span>
              </div>
            </div>
            {loadingMonthly ? (
              <Skeleton.Paragraph lineCount={4} animated />
            ) : (
              <BarChart data={chartData} />
            )}
          </div>

          {yearTotal && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Tổng thu</span>
                <span className="font-semibold text-blue-600">
                  {yearTotal.collected.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-gray-600">Tổng chi</span>
                <span className="font-semibold text-red-500">
                  {yearTotal.expenses.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                <span className="text-sm font-semibold text-blue-700">Lợi nhuận</span>
                <span className={`font-bold ${yearTotal.profit >= 0 ? 'text-blue-700' : 'text-red-500'}`}>
                  {yearTotal.profit >= 0 ? '+' : ''}{yearTotal.profit.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          )}

          {monthly && (
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 gap-0 border-b border-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
                <span>Tháng</span>
                <span className="text-right">Thu</span>
                <span className="text-right">Chi</span>
                <span className="text-right">Lãi</span>
              </div>
              {monthly.map((m) => (
                <div key={m.month} className="grid grid-cols-4 border-b border-gray-50 px-4 py-2.5 text-sm last:border-0">
                  <span className="text-gray-600">{m.month.slice(5)}</span>
                  <span className="text-right text-blue-600">{formatPrice(m.totalCollected)}</span>
                  <span className="text-right text-red-400">{formatPrice(m.totalExpenses)}</span>
                  <span className={`text-right font-medium ${m.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.profit >= 0 ? '+' : ''}{formatPrice(m.profit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
