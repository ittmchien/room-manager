"use client";

import { TabBar } from "antd-mobile";
import { DoorOpen, LayoutGrid, Receipt, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useInvoices } from "@/hooks/use-invoices";
import { useProperty } from "@/contexts/property-context";

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { propertyId } = useProperty();

  const { data: invoices } = useInvoices(propertyId, getCurrentBillingPeriod());
  const pendingCount = invoices?.filter((inv) => inv.status !== "PAID").length ?? 0;

  const tabs = [
    { key: "/dashboard", title: "Tổng quan", icon: LayoutGrid, badge: 0 },
    { key: "/rooms", title: "Phòng", icon: DoorOpen, badge: 0 },
    { key: "/invoices", title: "Hóa đơn", icon: Receipt, badge: pendingCount },
    { key: "/settings", title: "Cài đặt", icon: Settings, badge: 0 },
  ];

  const activeKey =
    tabs.find((t) => pathname.startsWith(t.key))?.key ?? "/dashboard";

  return (
    <div className="sticky bottom-0 z-50 w-full max-w-md border-t border-gray-100 bg-white left-0">
      <TabBar activeKey={activeKey} onChange={(key) => router.push(key)}>
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            icon={(active: boolean) => (
              <div className="relative">
                <tab.icon
                  className={cn("h-5 w-5", active ? "text-blue-600" : "text-gray-400")}
                />
                {tab.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>
            )}
            title={tab.title}
          />
        ))}
      </TabBar>
    </div>
  );
}
