'use client';

import { useRouter } from 'next/navigation';
import { Room } from '@/hooks/use-rooms';
import { Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

const statusConfig = {
  OCCUPIED: {
    label: 'Đang thuê',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  VACANT: {
    label: 'Trống',
    bar: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-600',
    dot: 'bg-blue-400',
  },
  MAINTENANCE: {
    label: 'Sửa chữa',
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-400',
  },
} as const;

export function RoomCard({ room, onPress }: { room: Room; onPress?: (id: string) => void }) {
  const router = useRouter();
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];
  const cfg = statusConfig[room.status as keyof typeof statusConfig] ?? statusConfig.VACANT;

  return (
    <button
      onClick={() => onPress ? onPress(room.id) : router.push(`/rooms/${room.id}`)}
      className="group flex w-full overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/40 transition-all hover:shadow-md hover:shadow-blue-100/60 active:scale-[0.99] text-left"
    >
      {/* Status bar */}
      <div className={cn('w-1 shrink-0', cfg.bar)} />

      <div className="flex flex-1 items-center gap-3 p-4">
        {/* Info */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{room.name}</span>
            {room.floor != null && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400">
                Tầng {room.floor}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(room.rentPrice)}
            </span>
            <span className="text-[11px] font-medium text-gray-400">đ/tháng</span>
          </div>

          {firstTenant ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {firstTenant.name}
                {activeTenantsCount > 1 && (
                  <span className="ml-1 font-semibold text-blue-500">+{activeTenantsCount - 1}</span>
                )}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Chưa có người thuê</p>
          )}
        </div>

        {/* Status + chevron */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', cfg.badge)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
            {cfg.label}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
