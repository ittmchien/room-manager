'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Tag, Skeleton } from 'antd-mobile';
import { Plus } from 'lucide-react';
import { useRoom, useUpdateRoom } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';
import { TenantList } from '@/components/tenants/tenant-list';
import { TenantFormModal } from '@/components/tenants/tenant-form-modal';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

const STATUS_MAP = {
  VACANT: { label: 'Trống', color: 'primary' as const },
  OCCUPIED: { label: 'Đang thuê', color: 'success' as const },
  MAINTENANCE: { label: 'Sửa chữa', color: 'warning' as const },
};

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
      <div className="space-y-4 p-4">
        <Skeleton.Title animated />
        <Skeleton.Paragraph lineCount={4} animated />
      </div>
    );
  }

  if (!room) {
    return <div className="py-8 text-center text-gray-400">Không tìm thấy phòng</div>;
  }

  const statusCfg = STATUS_MAP[room.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.VACANT;

  return (
    <div className="space-y-4">
      {/* NavBar replacement - header inside main */}
      <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">{room.name}</h1>
          <Tag color={statusCfg.color} className="mt-0.5">{statusCfg.label}</Tag>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Rent card */}
        <Card className="[--border-radius:16px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">GIÁ THUÊ</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(room.rentPrice)}</p>
          <p className="text-sm text-gray-400">
            {room.rentCalcType === 'FIXED' ? 'Giá cố định/tháng' : 'Theo đầu người'}
          </p>

          <div className="mt-4 flex gap-2">
            {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => (
              <Button
                key={s}
                size="small"
                color={room.status === s ? 'primary' : 'default'}
                fill={room.status === s ? 'solid' : 'outline'}
                onClick={() => handleStatusChange(s)}
                className="!rounded-[20px]"
              >
                {s === 'VACANT' ? 'Trống' : s === 'OCCUPIED' ? 'Đang thuê' : 'Sửa chữa'}
              </Button>
            ))}
          </div>
        </Card>

        {/* Tenants */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Người thuê</h2>
            <TenantFormModal
              roomId={id}
              trigger={
                <Button size="mini" color="primary" fill="outline" className="!rounded-[20px]">
                  <Plus className="mr-1 h-3 w-3 inline" />
                  Thêm
                </Button>
              }
            />
          </div>

          {loadingTenants ? (
            <Skeleton.Paragraph lineCount={3} animated />
          ) : (
            <TenantList tenants={tenants ?? []} roomId={id} />
          )}
        </div>
      </div>
    </div>
  );
}
