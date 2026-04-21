import Link from 'next/link';
import { Room } from '@/hooks/use-rooms';
import { RoomStatusBadge } from './room-status-badge';
import { Users } from 'lucide-react';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export function RoomCard({ room }: { room: Room }) {
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm shadow-blue-100/40 transition-all hover:shadow-md hover:shadow-blue-100/60 active:scale-[0.99]"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{room.name}</span>
          {room.floor != null && (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">
              Tầng {room.floor}
            </span>
          )}
        </div>

        <div>
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(room.rentPrice)}
          </span>
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            đ/tháng
          </span>
        </div>

        {firstTenant ? (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-3.5 w-3.5" />
            <span>
              {firstTenant.name}
              {activeTenantsCount > 1 && (
                <span className="ml-1 font-medium text-blue-500">+{activeTenantsCount - 1}</span>
              )}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Chưa có người thuê</div>
        )}
      </div>

      <RoomStatusBadge status={room.status} />
    </Link>
  );
}
