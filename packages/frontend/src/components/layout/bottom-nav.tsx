"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useInvoices } from "@/hooks/use-invoices";
import { useProperty } from "@/contexts/property-context";

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const tabs = [
  { key: "/dashboard", title: "Tổng quan", icon: "dashboard" },
  { key: "/rooms", title: "Phòng", icon: "door_front" },
  { key: "/invoices", title: "Hóa đơn", icon: "receipt_long" },
  { key: "/meter-readings", title: "Ghi số", icon: "edit_note" },
  { key: "/settings", title: "Cài đặt", icon: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { propertyId } = useProperty();

  const { data: invoices } = useInvoices(propertyId, getCurrentBillingPeriod());
  const pendingCount = invoices?.filter((inv) => inv.status !== "PAID").length ?? 0;

  const activeKey =
    tabs.find((t) => pathname.startsWith(t.key))?.key ?? "/dashboard";

  return (
    <nav className="sticky bottom-0 z-50 w-full max-w-md border-t border-outline-variant/15 bg-surface-container-lowest/80 backdrop-blur-xl rounded-t-2xl shadow-[0_-4px_24px_rgba(23,28,31,0.04)]">
      <div className="flex justify-around items-center px-2 pb-6 pt-2">
        {tabs.map((tab) => {
          const isActive = activeKey === tab.key;
          const badge = tab.key === "/invoices" ? pendingCount : 0;

          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 font-headline text-[10px] uppercase tracking-wider",
                isActive
                  ? "bg-primary text-on-primary scale-110"
                  : "text-on-surface-variant active:bg-surface-container-low"
              )}
            >
              <span
                className="material-symbols-outlined mb-1 text-xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="relative">
                {tab.title}
                {badge > 0 && !isActive && (
                  <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error ring-2 ring-surface-container-lowest">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
