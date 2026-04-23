'use client';

import { Button, Card, Popup, Skeleton, Tag } from 'antd-mobile';
import { Plus, X } from 'lucide-react';
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

interface Props {
  roomId: string | null;
  onClose: () => void;
}

function RoomDetailContent({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const { data: room, isPending } = useRoom(roomId);
  const { data: tenants, isPending: loadingTenants } = useTenants(roomId);
  const updateRoom = useUpdateRoom();

  const statusCfg = room
    ? (STATUS_MAP[room.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.VACANT)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="h-1 w-10 rounded-full bg-gray-200" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton.Title animated className="w-24" />
          ) : (
            <>
              <span className="text-base font-bold text-gray-900">{room?.name}</span>
              {statusCfg && <Tag color={statusCfg.color}>{statusCfg.label}</Tag>}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Rent card */}
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">GIÁ THUÊ</p>
          {isPending ? (
            <Skeleton.Paragraph lineCount={2} animated />
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(room!.rentPrice)}</p>
              <p className="text-sm text-gray-400">
                {room!.rentCalcType === 'FIXED' ? 'Giá cố định/tháng' : 'Theo đầu người'}
              </p>
            </>
          )}

          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-gray-400">Chuyển trạng thái</p>
            <div className="flex gap-2">
              {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => (
                <Button
                  key={s}
                  size="small"
                  color={room?.status === s ? 'primary' : 'default'}
                  fill={room?.status === s ? 'solid' : 'outline'}
                  disabled={isPending || room?.status === s}
                  onClick={() => updateRoom.mutate({ id: roomId, data: { status: s } })}
                >
                  {s === 'VACANT' ? 'Trống' : s === 'OCCUPIED' ? 'Đang thuê' : 'Sửa chữa'}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Tenants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">Người thuê</h2>
            <TenantFormModal
              roomId={roomId}
              trigger={
                <Button size="mini" color="primary" fill="outline">
                  <Plus className="mr-1 h-3 w-3 inline" />
                  Thêm
                </Button>
              }
            />
          </div>
          {loadingTenants ? (
            <Skeleton.Paragraph lineCount={3} animated />
          ) : (
            <TenantList tenants={tenants ?? []} roomId={roomId} />
          )}
        </div>
      </div>
    </div>
  );
}

export function RoomDetailPopup({ roomId, onClose }: Props) {
  return (
    <Popup
      visible={!!roomId}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        height: '88vh',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {roomId && <RoomDetailContent roomId={roomId} onClose={onClose} />}
    </Popup>
  );
}
