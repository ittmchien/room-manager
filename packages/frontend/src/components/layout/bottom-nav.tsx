'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  DoorOpen,
  Receipt,
  Gauge,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5"
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                  isActive ? 'bg-blue-600' : 'bg-transparent',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-white' : 'text-gray-400',
                  )}
                />
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
