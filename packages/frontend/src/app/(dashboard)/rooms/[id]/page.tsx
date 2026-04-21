'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { useRoom, useUpdateRoom } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';
import { RoomStatusBadge } from '@/components/rooms/room-status-badge';
import { TenantList } from '@/components/tenants/tenant-list';
import { TenantFormModal } from '@/components/tenants/tenant-form-modal';
import { Button } from '@/components/ui/button';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: room, isLoading: loadingRoom } = useRoom(id);
  const { data: tenants, isLoading: loadingTenants } = useTenants(id);
  const updateRoom = useUpdateRoom();

  const handleStatusChange = (status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE') => {
    updateRoom.mutate({ id, data: { status } });
  };

  if (loadingRoom) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white" />
        <div className="h-32 animate-pulse rounded-xl bg-white" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-8 text-center text-gray-500">Không tìm thấy phòng</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{room.name}</h1>
              {room.floor != null && (
                <span className="text-sm text-gray-400">Tầng {room.floor}</span>
              )}
            </div>
            <RoomStatusBadge status={room.status} />
          </div>
        </div>
      </div>

      {/* Room info card */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          GIÁ THUÊ
        </p>
        <p className="mt-1 text-2xl font-bold">{formatPrice(room.rentPrice)}</p>
        <p className="text-sm text-gray-500">
          {room.rentCalcType === 'FIXED' ? 'Giá cố định/tháng' : 'Theo đầu người'}
        </p>

        {/* Status change */}
        <div className="mt-4 flex gap-2">
          {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                room.status === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'VACANT' ? 'Trống' : s === 'OCCUPIED' ? 'Đang thuê' : 'Sửa chữa'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Người thuê</h2>
          <TenantFormModal
            roomId={id}
            trigger={
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Thêm
              </Button>
            }
          />
        </div>
        {loadingTenants ? (
          <div className="h-20 animate-pulse rounded-xl bg-white" />
        ) : (
          <TenantList tenants={tenants ?? []} roomId={id} />
        )}
      </div>
    </div>
  );
}
