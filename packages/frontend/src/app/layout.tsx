import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Room Manager',
  description: 'Quản lý phòng trọ dễ dàng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F0F4FF] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
