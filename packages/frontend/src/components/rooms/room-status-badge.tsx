import { cn } from '@/lib/utils';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

const statusConfig: Record<RoomStatus, { label: string; className: string }> = {
  VACANT: { label: 'Trống', className: 'bg-gray-100 text-gray-600' },
  OCCUPIED: { label: 'Đang thuê', className: 'bg-blue-100 text-blue-700' },
  MAINTENANCE: { label: 'Sửa chữa', className: 'bg-orange-100 text-orange-700' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
