export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#dbeafe_0%,#f0f4ff_50%,#ffffff_100%)]"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-blue-200/40 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
