export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-8 bg-surface">
      {/* Ambient background blobs — Stitch style */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container opacity-5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary opacity-5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-xl p-8 shadow-ambient">
        {children}
      </div>
    </div>
  );
}
