'use client';

import { Plus } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { RoomCard } from '@/components/rooms/room-card';
import { RoomFormModal } from '@/components/rooms/room-form-modal';
import { Button } from '@/components/ui/button';

export default function RoomsPage() {
  const { data: properties, isLoading: loadingProps } = useProperties();

  // Use first property by default (multi-property in Phase 4)
  const propertyId = properties?.[0]?.id ?? '';
  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);

  const isLoading = loadingProps || loadingRooms;

  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Phòng trọ</h1>
          {rooms && (
            <p className="text-sm text-gray-500">
              {occupiedCount}/{rooms.length} đang thuê · {vacantCount} trống
            </p>
          )}
        </div>
        {propertyId && (
          <RoomFormModal
            propertyId={propertyId}
            trigger={
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Thêm phòng
              </Button>
            }
          />
        )}
      </div>

      {/* Room list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : !propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hoàn thành onboarding để thiết lập khu trọ đầu tiên.
          </p>
        </div>
      ) : rooms?.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏠</p>
          <p className="mt-3 font-medium">Chưa có phòng nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bấm &quot;Thêm phòng&quot; để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms?.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}
