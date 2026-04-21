'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useRooms } from '@/hooks/use-rooms';
import { RoomCard } from '@/components/rooms/room-card';
import { RoomFormModal } from '@/components/rooms/room-form-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'VACANT' | 'OCCUPIED';

const tabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'VACANT', label: 'Trống' },
  { value: 'OCCUPIED', label: 'Đang thuê' },
];

export default function RoomsPage() {
  const { data: properties, isLoading: loadingProps } = useProperties();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const propertyId = properties?.[0]?.id ?? '';
  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);

  const isLoading = loadingProps || loadingRooms;

  const filteredRooms = rooms?.filter((r) =>
    activeTab === 'all' ? true : r.status === activeTab,
  );

  const vacantCount = rooms?.filter((r) => r.status === 'VACANT').length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === 'OCCUPIED').length ?? 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phòng trọ</h1>
          {rooms && (
            <p className="text-sm text-gray-400">
              {occupiedCount}/{rooms.length} đang thuê · {vacantCount} trống
            </p>
          )}
        </div>
        {propertyId && (
          <RoomFormModal
            propertyId={propertyId}
            trigger={
              <Button size="sm" className="gap-1 rounded-xl bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Thêm phòng
              </Button>
            }
          />
        )}
      </div>

      {/* Filter tabs */}
      {rooms && rooms.length > 0 && (
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-all',
                activeTab === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Room list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : !propertyId ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-semibold text-gray-700">Chưa có khu trọ</p>
          <p className="mt-1 text-sm text-gray-400">
            Hoàn thành onboarding để thiết lập khu trọ đầu tiên.
          </p>
        </div>
      ) : filteredRooms?.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏠</p>
          <p className="mt-3 font-semibold text-gray-700">
            {activeTab === 'all' ? 'Chưa có phòng nào' : 'Không có phòng'}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {activeTab === 'all' ? 'Bấm "Thêm phòng" để bắt đầu.' : 'Thử chọn tab khác.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRooms?.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}
