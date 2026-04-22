'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { useHasFeature, FEATURE_KEYS } from '@/hooks/use-features';
import { PremiumModal } from '@/components/premium/premium-modal';

const mainNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutGrid },
  { href: '/rooms', label: 'Phòng', icon: DoorOpen },
  { href: '/invoices', label: 'Hóa đơn', icon: Receipt },
  { href: '/meters', label: 'Chỉ số', icon: Gauge },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const hasContracts = useHasFeature(FEATURE_KEYS.CONTRACTS);
  const hasExpenses = useHasFeature(FEATURE_KEYS.EXPENSES);
  const hasReports = useHasFeature(FEATURE_KEYS.FINANCIAL_REPORTS);

  const premiumNavItems = [
    { href: '/tenants', label: 'Người thuê', icon: Users, locked: false },
    { href: '/contracts', label: 'Hợp đồng', icon: FileText, locked: !hasContracts },
    { href: '/expenses', label: 'Thu/Chi', icon: Wallet, locked: !hasExpenses },
    { href: '/reports', label: 'Báo cáo', icon: TrendingUp, locked: !hasReports },
  ];

  const handleNavClick = (href: string, locked: boolean) => {
    if (locked) {
      setPremiumModalOpen(true);
    } else {
      router.push(href);
    }
  };

  return (
    <>
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
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  isActive
                    ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <div className="my-2 border-t" />

          {premiumNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href, item.locked)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                  isActive
                    ? 'border-l-2 border-blue-600 bg-blue-50 font-semibold text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50',
                  item.locked && 'opacity-60',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.locked && <Lock className="ml-auto h-3 w-3" />}
              </button>
            );
          })}
        </nav>
      </aside>

      <PremiumModal visible={premiumModalOpen} onClose={() => setPremiumModalOpen(false)} />
    </>
  );
}
