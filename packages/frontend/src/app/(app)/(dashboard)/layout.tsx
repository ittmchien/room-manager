"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { PropertyProvider } from "@/contexts/property-context";
import { useIsFetching } from "@tanstack/react-query";
import { ConfigProvider } from "antd-mobile";
import viVN from "antd-mobile/es/locales/vi-VN";
import { useLayoutEffect, useRef, useState } from "react";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  const [loaded, setLoaded] = useState(false);
  const fetchStarted = useRef(false);

  useLayoutEffect(() => {
    if (isFetching > 0) fetchStarted.current = true;
    if (fetchStarted.current && isFetching === 0) setLoaded(true);
  }, [isFetching]);

  return (
    <>
      {!loaded && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm text-gray-400">Đang tải...</p>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto py-2 px-2 xxs:px-3 xs:px-4 [&_.no-padding]:-mx-2 xxs:[&_.no-padding]:-mx-3 xs:[&_.no-padding]:-mx-4">
        {children}
      </main>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider locale={viVN}>
      <PropertyProvider>
        <div className="flex h-dvh flex-col bg-gray-50">
          <TopBar />
          <DashboardInner>{children}</DashboardInner>
          <BottomNav />
        </div>
      </PropertyProvider>
    </ConfigProvider>
  );
}
