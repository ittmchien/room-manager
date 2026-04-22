"use client";

import { TabBar } from "antd-mobile";
import { DoorOpen, LayoutGrid, Receipt, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
// Feature gating for bottom-nav tabs uses useHasFeature — no static env-var checks here.

const tabs = [
  { key: "/dashboard", title: "Tổng quan", icon: LayoutGrid },
  { key: "/rooms", title: "Phòng", icon: DoorOpen },
  { key: "/invoices", title: "Hóa đơn", icon: Receipt },
  { key: "/settings", title: "Cài đặt", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey =
    tabs.find((t) => pathname.startsWith(t.key))?.key ?? "/dashboard";

  return (
    <div className="fixed bottom-0 z-50 w-full max-w-md border-t border-gray-100 bg-white left-1/2 -translate-x-1/2">
      <TabBar
        activeKey={activeKey}
        onChange={(key) => router.push(key)}
      >
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            icon={(active: boolean) => (
              <tab.icon
                className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400"}`}
              />
            )}
            title={tab.title}
          />
        ))}
      </TabBar>
    </div>
  );
}
