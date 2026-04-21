import { cn } from '@/lib/utils';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

const statusConfig: Record<RoomStatus, { label: string; dotClass: string; textClass: string }> = {
  OCCUPIED: { label: 'Đang thuê', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
  VACANT: { label: 'Trống', dotClass: 'bg-gray-400', textClass: 'text-gray-500' },
  MAINTENANCE: { label: 'Sửa chữa', dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-medium', config.textClass)}>
      <span className={cn('h-2 w-2 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
}
