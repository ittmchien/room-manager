"use client";

import { GenerateInvoiceModal } from "@/components/invoices/generate-invoice-modal";
import { useProperty } from "@/contexts/property-context";
import { useInvoices } from "@/hooks/use-invoices";
import {
  ErrorBlock,
  InfiniteScroll,
  List,
  Loading,
} from "antd-mobile";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 3;

const statusConfig = {
  PAID: { label: "Đã thu", badge: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  PENDING: { label: "Chưa thu", badge: "bg-red-50 text-red-600", bar: "bg-red-400" },
  PARTIAL: { label: "Thu 1 phần", badge: "bg-amber-50 text-amber-700", bar: "bg-amber-400" },
} as const;

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return `Tháng ${month}/${year}`;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { propertyId } = useProperty();
  const [modalOpen, setModalOpen] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState(PAGE_SIZE);

  const { data: invoices, isPending } = useInvoices(propertyId);

  const groups = useMemo(() => {
    if (!invoices) return [];
    const map: Record<string, typeof invoices> = {};
    for (const inv of invoices) {
      if (!map[inv.billingPeriod]) map[inv.billingPeriod] = [];
      map[inv.billingPeriod].push(inv);
    }
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([period, items]) => ({ period, items }));
  }, [invoices]);

  const visibleGroups = groups.slice(0, visibleMonths);
  const hasMore = visibleMonths < groups.length;

  return (
    <div className="no-padding">
      <div className="flex items-center justify-between px-4 mb-3">
        <h1 className="text-xl font-bold">Hóa đơn</h1>
        {propertyId && (
          <Button
            size="small"
            color="primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4 inline" />
            Tạo hóa đơn
          </Button>
        )}
      </div>

      {!propertyId ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 className="h-7 w-7 text-blue-400" />
          </div>
          <p className="mt-4 font-medium text-gray-700">Chưa có khu trọ</p>
        </div>
      ) : isPending ? (
        <div className="flex justify-center py-16">
          <Loading color="primary" />
        </div>
      ) : groups.length === 0 ? (
        <ErrorBlock
          status="empty"
          description="Chưa có hóa đơn. Bấm 'Tạo hóa đơn' để bắt đầu."
        />
      ) : (
        <div>
          {visibleGroups.map(({ period, items }) => (
            <List
              key={period}
              header={
                <span className="text-sm font-semibold text-gray-700">
                  {formatPeriod(period)}
                </span>
              }
              className="mb-3 no-border"
            >
              {items.map((invoice) => {
                const cfg = statusConfig[invoice.status];
                const remaining = invoice.total - invoice.paidAmount;
                return (
                  <List.Item
                    key={invoice.id}
                    clickable
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                    prefix={
                      <div className={cn("w-1 self-stretch rounded-sm", cfg.bar)} />
                    }
                    description={
                      <span className="text-xs text-gray-400">
                        {formatPeriod(invoice.billingPeriod)}
                        {invoice.tenant?.name && ` · ${invoice.tenant.name}`}
                      </span>
                    }
                    extra={
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {invoice.total.toLocaleString("vi-VN")}đ
                        </p>
                        {invoice.status !== "PAID" && remaining > 0 && (
                          <p className="text-xs text-gray-400">
                            Còn {remaining.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                      </div>
                    }
                    arrow
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {invoice.room?.name ?? "—"}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", cfg.badge)}>
                        {cfg.label}
                      </span>
                    </div>
                  </List.Item>
                );
              })}
            </List>
          ))}
          <InfiniteScroll
            loadMore={async () => {
              setVisibleMonths((n) => n + PAGE_SIZE);
            }}
            hasMore={hasMore}
          >
            {hasMore ? (
              <span className="text-xs text-gray-400">Đang tải...</span>
            ) : (
              <span className="text-xs text-gray-400">Đã hiển thị tất cả</span>
            )}
          </InfiniteScroll>
        </div>
      )}

      <GenerateInvoiceModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        propertyId={propertyId}
      />
    </div>
  );
}
