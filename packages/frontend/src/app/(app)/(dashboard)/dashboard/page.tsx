"use client";

import { Fragment } from "react";

import { AdBanner } from "@/components/ads/ad-banner";
import { PushNotificationBanner } from "@/components/dashboard/push-notification-banner";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { useProperty } from "@/contexts/property-context";
import { Invoice, useInvoices } from "@/hooks/use-invoices";
import { useRooms } from "@/hooks/use-rooms";
import { cn } from "@/lib/utils";
import { Button, Card, List } from "antd-mobile";
import {
  BarChart3,
  Building2,
  DoorOpen,
  FileText,
  Home,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

function computeStats(invoices: Invoice[] | undefined) {
  if (!invoices) return { totalRevenue: 0, pendingInvoices: [] as Invoice[] };
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const pendingInvoices = invoices.filter((inv) => inv.status !== "PAID");
  return { totalRevenue, pendingInvoices };
}

export default function DashboardPage() {
  const router = useRouter();
  const { propertyId } = useProperty();
  const billingPeriod = getCurrentBillingPeriod();
  const [year, month] = billingPeriod.split("-");

  const { data: rooms, isPending: loadingRooms } = useRooms(propertyId);
  const { data: invoices, isPending: loadingInvoices } = useInvoices(
    propertyId,
    billingPeriod,
  );

  const totalRooms = rooms?.length ?? 0;
  const occupiedCount =
    rooms?.filter((r) => r.status === "OCCUPIED").length ?? 0;
  const vacantCount = rooms?.filter((r) => r.status === "VACANT").length ?? 0;
  const { totalRevenue, pendingInvoices } = computeStats(invoices);

  const isLoading = loadingRooms || loadingInvoices;

  if (!propertyId) {
    return (
      <Card bodyClassName="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Building2 className="h-7 w-7 text-blue-400" />
        </div>
        <p className="mt-4 font-semibold text-gray-700">Chưa có khu trọ</p>
        <p className="mt-1 text-sm text-gray-400">
          Hoàn thành onboarding để bắt đầu.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AdBanner position="top" />
      <PushNotificationBanner />
      {/* Hero */}
      <Card
        className="!bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200"
        bodyClassName="bg-gradient-to-br from-blue-600 to-blue-500 p-5"
      >
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
            onClick={() => router.push("/invoices")}
            className="!bg-white/20 !border-none !text-white !text-sm !font-medium"
          >
            <Receipt className="mr-1 inline h-4 w-4" />
            Hóa đơn
          </Button>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Tổng phòng",
            value: totalRooms,
            color: "text-gray-900",
            icon: Home,
            iconBg: "bg-gray-100",
            iconColor: "text-gray-500",
          },
          {
            label: "Đang thuê",
            value: occupiedCount,
            color: "text-emerald-600",
            icon: Users,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
          },
          {
            label: "Phòng trống",
            value: vacantCount,
            color: "text-blue-500",
            icon: DoorOpen,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-400",
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm shadow-blue-100/30" bodyClassName="px-2 py-2.5">
            <div
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-lg",
                stat.iconBg,
              )}
            >
              <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
            </div>
            {isLoading ? (
              <div className="mt-2 h-7 w-10 animate-pulse rounded bg-gray-100" />
            ) : (
              <p className={cn("mt-1.5 text-2xl font-bold", stat.color)}>
                {stat.value}
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-gray-400 leading-tight">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Pending invoices */}
      <Card
        title={<span className="text-sm font-semibold text-gray-700">Chưa thanh toán</span>}
        extra={<Link href="/invoices" className="text-xs font-medium text-blue-600">Xem tất cả →</Link>}
        className="shadow-sm shadow-blue-100/30"
      >
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        ) : pendingInvoices.length === 0 ? (
          <div className="py-4 text-center text-sm font-medium text-emerald-600">
            Tất cả hóa đơn đã được thanh toán
          </div>
        ) : (
          <List className="-mx-3 no-border">
            {pendingInvoices.slice(0, 5).map((inv, idx) => (
              <Fragment key={inv.id}>
                {idx > 0 && <div className="mx-3 h-px bg-gray-100" />}
                <List.Item
                  clickable
                  onClick={() => router.push(`/invoices/${inv.id}`)}
                  description={<span className="text-xs text-gray-400">{inv.tenant?.name ?? "—"} · {formatPrice(inv.total)}</span>}
                  extra={<InvoiceStatusBadge status={inv.status} />}
                  arrow={false}
                >
                  <span className="text-sm font-medium text-gray-800">{inv.room?.name ?? "—"}</span>
                </List.Item>
              </Fragment>
            ))}
          </List>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Thu / Chi",
            icon: Wallet,
            href: "/expenses",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Hợp đồng",
            icon: FileText,
            href: "/contracts",
            color: "text-violet-500",
            bg: "bg-violet-50",
          },
          {
            label: "Báo cáo",
            icon: BarChart3,
            href: "/reports",
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
        ].map((item) => (
          <Card
            key={item.href}
            onClick={() => router.push(item.href)}
            className="shadow-sm shadow-blue-100/30 active:scale-95 transition-transform cursor-pointer"
            bodyClassName="px-2 py-2.5 flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                item.bg,
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", item.color)} />
            </div>
            <span className="text-xs font-medium text-gray-600">
              {item.label}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
