'use client';

import Link from 'next/link';
import { Receipt, Gauge, TrendingUp } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { useInvoices, Invoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function computeStats(invoices: Invoice[] | undefined) {
  if (!invoices) return { totalRevenue: 0, pendingInvoices: [] as Invoice[] };
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingInvoices = invoices.filter((inv) => inv.status !== 'PAID');
  return { totalRevenue, pendingInvoices };
}

export default function DashboardPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';
  const billingPeriod = getCurrentBillingPeriod();
  const [year, month] = billingPeriod.split('-');

  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const { data: invoices, isLoading: loadingInvoices } = useInvoices(propertyId, billingPeriod);

  const totalRooms = rooms?.length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;
  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const { totalRevenue, pendingInvoices } = computeStats(invoices);

  const isLoading = loadingRooms || loadingInvoices;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-5 text-white shadow-lg shadow-blue-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100">
          <TrendingUp className="h-3.5 w-3.5" />
          Tổng thu tháng {month}/{year}
        </div>
        {isLoading ? (
          <div className="mt-2 h-9 w-40 animate-pulse rounded bg-blue-400/40" />
        ) : (
          <p className="mt-1 text-3xl font-bold">{formatPrice(totalRevenue)}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Link
            href="/invoices"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Receipt className="h-4 w-4" />
            Hóa đơn
          </Link>
          <Link
            href="/meters"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <Gauge className="h-4 w-4" />
            Ghi số
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng phòng', value: totalRooms, color: 'text-gray-900' },
          { label: 'Đang thuê', value: occupiedCount, color: 'text-emerald-600' },
          { label: 'Trống', value: vacantCount, color: 'text-gray-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-sm shadow-blue-100/30">
            <p className="text-xs text-gray-400">{stat.label}</p>
            {isLoading ? (
              <div className="mt-1 h-7 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={`mt-0.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pending invoices */}
      <div className="rounded-2xl bg-white shadow-sm shadow-blue-100/30">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Chưa thanh toán</h2>
          <Link href="/invoices" className="text-xs font-medium text-blue-600">
            Xem tất cả →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-px p-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        ) : pendingInvoices.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            🎉 Tất cả hóa đơn đã được thanh toán
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingInvoices.slice(0, 5).map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {inv.room?.name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {inv.tenant?.name ?? '—'} · {formatPrice(inv.total)}
                  </p>
                </div>
                <InvoiceStatusBadge status={inv.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {!propertyId && !isLoading && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-semibold text-gray-700">Chưa có khu trọ</p>
          <p className="mt-1 text-sm text-gray-400">Hoàn thành onboarding để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
