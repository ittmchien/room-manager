'use client';

import { Button, Popup, Skeleton } from 'antd-mobile';
import { Plus, X } from 'lucide-react';
import { useRoom, useUpdateRoom } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';
import { TenantList } from '@/components/tenants/tenant-list';
import { TenantFormModal } from '@/components/tenants/tenant-form-modal';
import { RoomStatusBadge } from '@/components/rooms/room-status-badge';

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}

const STATUS_LABELS = {
  VACANT: 'Trống',
  OCCUPIED: 'Đang thuê',
  MAINTENANCE: 'Sửa chữa',
} as const;

const STATUS_ACTIVE_CLASSES: Record<string, string> = {
  VACANT: 'bg-surface-variant text-on-surface-variant',
  OCCUPIED: 'bg-secondary-fixed text-on-secondary-fixed',
  MAINTENANCE: 'bg-tertiary-fixed text-on-tertiary-fixed',
};

interface Props {
  roomId: string | null;
  onClose: () => void;
}

function RoomDetailContent({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const { data: room, isPending } = useRoom(roomId);
  const { data: tenants, isPending: loadingTenants } = useTenants(roomId);
  const updateRoom = useUpdateRoom();

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="h-1 w-10 rounded-full bg-outline-variant/30" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/15">
        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton.Title animated className="w-24" />
          ) : (
            <>
              <span className="font-headline font-semibold text-on-surface text-base">{room?.name}</span>
              {room && <RoomStatusBadge status={room.status as 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'} />}
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Rent card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient-sm">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-wider">GIÁ THUÊ</p>
          {isPending ? (
            <Skeleton.Paragraph lineCount={2} animated />
          ) : (
            <>
              <p className="mt-1 font-headline font-bold text-on-surface text-2xl">
                {formatPrice(room!.rentPrice)}
                <span className="font-label text-sm text-on-surface-variant ml-0.5">đ</span>
              </p>
              <p className="font-label text-sm text-on-surface-variant">
                {room!.rentCalcType === 'FIXED' ? 'Giá cố định/tháng' : 'Theo đầu người'}
              </p>
            </>
          )}

          <div className="mt-3 space-y-1.5">
            <p className="font-label text-sm text-on-surface-variant">Chuyển trạng thái</p>
            <div className="flex gap-2 flex-wrap">
              {(['VACANT', 'OCCUPIED', 'MAINTENANCE'] as const).map((s) => {
                const isActive = room?.status === s;
                return (
                  <button
                    key={s}
                    disabled={isPending || isActive}
                    onClick={() => updateRoom.mutate({ id: roomId, data: { status: s } })}
                    className={[
                      'px-3 py-1 rounded-full font-label text-sm transition-colors',
                      isActive
                        ? STATUS_ACTIVE_CLASSES[s]
                        : 'bg-surface-container-low text-on-surface-variant',
                      isPending || isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    ].join(' ')}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tenants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline font-semibold text-on-surface">Người thuê</h2>
            <TenantFormModal
              roomId={roomId}
              trigger={
                <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low text-primary rounded-lg font-label text-sm">
                  <Plus className="h-3 w-3" />
                  Thêm
                </button>
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
