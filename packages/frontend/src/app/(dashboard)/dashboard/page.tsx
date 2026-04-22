'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Receipt, Gauge, TrendingUp, Home, Users, DoorOpen } from 'lucide-react';
import { Button, Skeleton } from 'antd-mobile';
import { useRooms } from '@/hooks/use-rooms';
import { useInvoices, Invoice } from '@/hooks/use-invoices';
import { InvoiceStatusBadge } from '@/components/invoices/invoice-status-badge';
import { PushNotificationBanner } from '@/components/dashboard/push-notification-banner';
import { AdBanner } from '@/components/ads/ad-banner';
import { useProperty } from '@/contexts/property-context';

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
  const router = useRouter();
  const { propertyId } = useProperty();
  const billingPeriod = getCurrentBillingPeriod();
  const [year, month] = billingPeriod.split('-');

  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const { data: invoices, isLoading: loadingInvoices } = useInvoices(propertyId, billingPeriod);

  const totalRooms = rooms?.length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;
  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const { totalRevenue, pendingInvoices } = computeStats(invoices);

  const isLoading = loadingRooms || loadingInvoices;

  if (!propertyId) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">🏘️</p>
        <p className="mt-3 font-semibold text-gray-700">Chưa có khu trọ</p>
        <p className="mt-1 text-sm text-gray-400">Hoàn thành onboarding để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdBanner position="top" />
      <PushNotificationBanner />
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
          <Button
            size="small"
            onClick={() => router.push('/invoices')}
            className="!rounded-xl !bg-white/20 !border-none !text-white !text-sm !font-medium"
          >
            <Receipt className="mr-1 inline h-4 w-4" />
            Hóa đơn
          </Button>
          <Button
            size="small"
            onClick={() => router.push('/meters')}
            className="!rounded-xl !bg-white/20 !border-none !text-white !text-sm !font-medium"
          >
            <Gauge className="mr-1 inline h-4 w-4" />
            Ghi số
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng phòng', value: totalRooms, color: 'text-gray-900', icon: Home, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
          { label: 'Đang thuê', value: occupiedCount, color: 'text-emerald-600', icon: Users, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          { label: 'Phòng trống', value: vacantCount, color: 'text-blue-500', icon: DoorOpen, iconBg: 'bg-blue-50', iconColor: 'text-blue-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-3 shadow-sm shadow-blue-100/30">
            <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
            </div>
            {isLoading ? (
              <div className="mt-2 h-7 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={`mt-1.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            )}
            <p className="mt-0.5 text-[11px] text-gray-400 leading-tight">{stat.label}</p>
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
              <button
                key={inv.id}
                onClick={() => router.push(`/invoices/${inv.id}`)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50/60 active:bg-gray-50"
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
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
