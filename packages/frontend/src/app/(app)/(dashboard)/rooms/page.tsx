"use client";

import { RoomCard } from "@/components/rooms/room-card";
import { RoomFormModal } from "@/components/rooms/room-form-modal";
import { RoomDetailPopup } from "@/components/rooms/room-detail-popup";
import { useProperty } from "@/contexts/property-context";
import { useRooms } from "@/hooks/use-rooms";
import { ErrorBlock, Loading } from "antd-mobile";
import { useState } from "react";

type FilterTab = "all" | "VACANT" | "OCCUPIED";

export default function RoomsPage() {
  const { propertyId } = useProperty();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { data: rooms, isPending } = useRooms(propertyId);

  const vacantCount = rooms?.filter((r) => r.status === "VACANT").length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === "OCCUPIED").length ?? 0;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `Tất cả (${rooms?.length ?? 0})` },
    { key: "VACANT", label: `Trống (${vacantCount})` },
    { key: "OCCUPIED", label: `Đang thuê (${occupiedCount})` },
  ];

  const filteredRooms =
    activeTab === "all"
      ? rooms
      : rooms?.filter((r) => r.status === activeTab);

  const emptyDescription =
    activeTab === "all"
      ? "Chưa có phòng nào"
      : activeTab === "VACANT"
      ? "Không có phòng trống"
      : "Không có phòng đang thuê";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[1.5rem] font-bold text-on-surface">Phòng trọ</h1>
          {rooms && (
            <p className="text-sm text-on-surface-variant">
              {occupiedCount}/{rooms.length} đang thuê · {vacantCount} trống
            </p>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      {propertyId && (
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) =>
            tab.key === activeTab ? (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="bg-primary-container text-on-primary-container font-label text-[0.875rem] font-medium rounded-full px-4 py-2 shadow-[0_2px_8px_rgba(23,28,31,0.06)]"
              >
                {tab.label}
              </button>
            ) : (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="bg-surface-container-high text-on-surface font-label text-[0.875rem] font-medium rounded-full px-4 py-2 hover:bg-surface-variant transition-colors"
              >
                {tab.label}
              </button>
            )
          )}
        </div>
      )}

      {!propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : isPending ? (
        <div className="flex justify-center py-16">
          <Loading color="primary" />
        </div>
      ) : filteredRooms?.length === 0 ? (
        <ErrorBlock status="empty" description={emptyDescription} className="mt-16" />
      ) : (
        <div className="space-y-3 pt-2">
          {filteredRooms?.map((room) => (
            <RoomCard key={room.id} room={room} onPress={setSelectedRoomId} />
          ))}
        </div>
      )}

      <RoomDetailPopup
        roomId={selectedRoomId}
        onClose={() => setSelectedRoomId(null)}
      />

      {/* FAB */}
      {propertyId && (
        <RoomFormModal
          propertyId={propertyId}
          trigger={
            <button
              className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-[0_8px_24px_rgba(0,74,198,0.3)] flex justify-center items-center active:scale-95 transition-transform z-40"
              aria-label="Thêm phòng"
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add
              </span>
            </button>
          }
        />
      )}
    </div>
  );
}
