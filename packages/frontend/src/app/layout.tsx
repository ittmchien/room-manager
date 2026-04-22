import { Providers } from "@/components/providers";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Room Manager",
  description: "Quản lý phòng trọ dễ dàng",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Room Manager",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-200 antialiased">
        <Providers>
          <div id="app-root" className="relative mx-auto min-h-dvh w-full max-w-md bg-white shadow-[0_0_60px_rgba(0,0,0,0.12)]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
