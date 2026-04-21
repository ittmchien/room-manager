import Link from 'next/link';
import { Room } from '@/hooks/use-rooms';
import { RoomStatusBadge } from './room-status-badge';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export function RoomCard({ room }: { room: Room }) {
  const activeTenantsCount = room._count.tenants;
  const firstTenant = room.tenants[0];

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{room.name}</span>
          {room.floor != null && (
            <span className="text-xs text-gray-400">Tầng {room.floor}</span>
          )}
        </div>
        <span className="text-sm text-gray-500">{formatPrice(room.rentPrice)}/tháng</span>
        {firstTenant && (
          <span className="text-sm text-gray-600">
            {firstTenant.name}
            {activeTenantsCount > 1 && ` +${activeTenantsCount - 1}`}
          </span>
        )}
      </div>
      <RoomStatusBadge status={room.status} />
    </Link>
  );
}
