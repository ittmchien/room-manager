export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF] px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-blue-50 bg-white p-8 shadow-xl shadow-blue-100/60">
        {children}
      </div>
    </div>
  );
}
