import type { Metadata } from "next";

export const metadata: Metadata = {
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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface-container-high overflow-hidden">
      <div
        id="app-root"
        className="relative mx-auto min-h-dvh w-full max-w-md bg-surface-container-lowest shadow-[0_0_60px_rgba(0,0,0,0.12)]"
      >
        {children}
      </div>
    </div>
  );
}
