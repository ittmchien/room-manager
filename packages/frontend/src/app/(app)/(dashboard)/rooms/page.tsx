"use client";

import { RoomCard } from "@/components/rooms/room-card";
import { RoomFormModal } from "@/components/rooms/room-form-modal";
import { RoomDetailPopup } from "@/components/rooms/room-detail-popup";
import { useProperty } from "@/contexts/property-context";
import { useRooms } from "@/hooks/use-rooms";
import { ErrorBlock, Loading, Tabs } from "antd-mobile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

type FilterTab = "all" | "VACANT" | "OCCUPIED";

export default function RoomsPage() {
  const { propertyId } = useProperty();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { data: rooms, isPending } = useRooms(propertyId);

  const vacantCount = rooms?.filter((r) => r.status === "VACANT").length ?? 0;
  const occupiedCount = rooms?.filter((r) => r.status === "OCCUPIED").length ?? 0;

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
              <Button size="middle" color="primary">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm phòng
              </Button>
            }
          />
        )}
      </div>

      {!propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as FilterTab)}
        >
          <Tabs.Tab title={`Tất cả (${rooms?.length ?? 0})`} key="all">
            {isPending ? (
              <div className="flex justify-center py-16">
                <Loading color="primary" />
              </div>
            ) : rooms?.length === 0 ? (
              <ErrorBlock status="empty" description="Chưa có phòng nào" className="mt-16" />
            ) : (
              <div className="space-y-3 pt-4">
                {rooms?.map((room) => (
                  <RoomCard key={room.id} room={room} onPress={setSelectedRoomId} />
                ))}
              </div>
            )}
          </Tabs.Tab>
          <Tabs.Tab title={`Trống (${vacantCount})`} key="VACANT">
            {vacantCount === 0 ? (
              <ErrorBlock status="empty" description="Không có phòng trống" className="mt-16" />
            ) : (
              <div className="space-y-3 pt-4">
                {rooms?.filter((r) => r.status === "VACANT").map((room) => (
                  <RoomCard key={room.id} room={room} onPress={setSelectedRoomId} />
                ))}
              </div>
            )}
          </Tabs.Tab>
          <Tabs.Tab title={`Đang thuê (${occupiedCount})`} key="OCCUPIED">
            {occupiedCount === 0 ? (
              <ErrorBlock status="empty" description="Không có phòng đang thuê" className="mt-16" />
            ) : (
              <div className="space-y-3 pt-4">
                {rooms?.filter((r) => r.status === "OCCUPIED").map((room) => (
                  <RoomCard key={room.id} room={room} onPress={setSelectedRoomId} />
                ))}
              </div>
            )}
          </Tabs.Tab>
        </Tabs>
      )}

      <RoomDetailPopup
        roomId={selectedRoomId}
        onClose={() => setSelectedRoomId(null)}
      />
    </div>
  );
}
