export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          TỔNG THU THÁNG NÀY
        </p>
        <p className="mt-1 text-3xl font-bold text-gray-900">0đ</p>
        <div className="mt-4 flex gap-3">
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
            + Tạo hóa đơn
          </button>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm">
            📋 Ghi số
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tổng phòng</p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Đang thuê</p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">🏠</p>
        <p className="mt-3 font-medium">Chưa có phòng nào</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thêm phòng đầu tiên để bắt đầu quản lý.
        </p>
      </div>
    </div>
  );
}
