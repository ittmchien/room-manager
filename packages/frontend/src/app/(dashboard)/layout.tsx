'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TopBar } from '@/components/layout/top-bar';
import { useProperties } from '@/hooks/use-properties';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: properties, isLoading } = useProperties();
  const propertyName = isLoading
    ? '...'
    : (properties?.[0]?.name ?? 'Room Manager');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar propertyName={propertyName} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
