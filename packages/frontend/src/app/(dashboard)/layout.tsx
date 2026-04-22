"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { PropertyProvider } from "@/contexts/property-context";
import { ConfigProvider } from "antd-mobile";
import viVN from "antd-mobile/es/locales/vi-VN";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={viVN}>
      <PropertyProvider>
        <div className="flex min-h-dvh flex-col bg-gray-50">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 pb-20">{children}</main>
          <BottomNav />
        </div>
      </PropertyProvider>
    </ConfigProvider>
  );
}
