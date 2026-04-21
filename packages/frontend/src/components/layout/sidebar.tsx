'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  DoorOpen,
  Receipt,
  Gauge,
  Settings,
  Users,
  FileText,
  TrendingUp,
  Wallet,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

const premiumNavItems = [
  { href: '/tenants', label: 'Người thuê', icon: Users, locked: false },
  { href: '/contracts', label: 'Hợp đồng', icon: FileText, locked: true },
  { href: '/expenses', label: 'Thu/Chi', icon: Wallet, locked: true },
  { href: '/reports', label: 'Báo cáo', icon: TrendingUp, locked: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:bg-white">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg text-white">
          🏠
        </div>
        <div>
          <p className="text-sm font-bold">Room Manager</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="my-2 border-t" />

        {premiumNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.locked ? '/store' : item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50',
                item.locked && 'opacity-60',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.locked && <Lock className="ml-auto h-3 w-3" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
