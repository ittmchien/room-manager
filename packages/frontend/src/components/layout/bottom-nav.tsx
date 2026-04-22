'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabBar } from 'antd-mobile';
import { LayoutGrid, DoorOpen, Receipt, Gauge, Settings } from 'lucide-react';
// Feature gating for bottom-nav tabs uses useHasFeature — no static env-var checks here.

const tabs = [
  { key: '/dashboard', title: 'Tổng quan', icon: LayoutGrid },
  { key: '/rooms', title: 'Phòng', icon: DoorOpen },
  { key: '/invoices', title: 'Hóa đơn', icon: Receipt },
  { key: '/meters', title: 'Chỉ số', icon: Gauge },
  { key: '/settings', title: 'Cài đặt', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeKey = tabs.find((t) => pathname.startsWith(t.key))?.key ?? '/dashboard';

  return (
    <div
      className="fixed bottom-0 z-50 w-full max-w-[425px] border-t border-gray-100 bg-white left-1/2 -translate-x-1/2"
    >
      <TabBar
        activeKey={activeKey}
        onChange={(key) => router.push(key)}
        style={{ '--adm-color-primary': '#2563EB' } as React.CSSProperties}
      >
        {tabs.map((tab) => (
          <TabBar.Item
            key={tab.key}
            icon={(active: boolean) => <tab.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />}
            title={tab.title}
          />
        ))}
      </TabBar>
    </div>
  );
}
