'use client';

import { useRouter } from 'next/navigation';
import { Room } from '@/hooks/use-rooms';
import { cn } from '@/lib/utils';
import { roomStatusStyles } from '@/lib/design-tokens';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export function RoomCard({ room, onPress }: { room: Room; onPress?: (id: string) => void }) {
  const router = useRouter();
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];
  const cfg = roomStatusStyles[room.status as keyof typeof roomStatusStyles] ?? roomStatusStyles.VACANT;

  return (
    <button
      onClick={() => onPress ? onPress(room.id) : router.push(`/rooms/${room.id}`)}
      className="group flex w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient-sm border-ghost transition-all active:scale-[0.98] text-left relative"
    >
      {/* Status accent bar */}
      <div className={cn('absolute left-0 top-4 bottom-4 w-1 rounded-r-full', cfg.bar)} />

      <div className="flex flex-1 flex-col gap-3 p-4 pl-5">
        {/* Top row: room name + status badge */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-headline text-[1.125rem] font-semibold text-on-surface">
              {room.name}
            </h2>
            {firstTenant ? (
              <p className="font-body text-[0.875rem] text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[1rem]">person</span>
                <span className="truncate">
                  {firstTenant.name}
                  {activeTenantsCount > 1 && (
                    <span className="ml-1 font-semibold text-primary">+{activeTenantsCount - 1}</span>
                  )}
                </span>
              </p>
            ) : (
              <p className="font-body text-[0.875rem] text-on-surface-variant mt-0.5 italic">
                Phòng trống
              </p>
            )}
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-1 rounded-full font-label text-[0.6875rem] font-medium uppercase tracking-wider',
            cfg.badge
          )}>
            {cfg.label}
          </span>
        </div>

        {/* Bottom row: info + price */}
        <div className="flex justify-between items-end">
          {room.floor != null && (
            <span className="font-body text-[0.875rem] text-on-surface-variant">
              Tầng {room.floor}
            </span>
          )}
          <p className="font-headline text-[1.25rem] font-bold text-primary ml-auto">
            {formatPrice(room.rentPrice)}
            <span className="text-[0.875rem] font-medium ml-0.5 opacity-80">đ</span>
          </p>
        </div>
      </div>
    </button>
  );
}
