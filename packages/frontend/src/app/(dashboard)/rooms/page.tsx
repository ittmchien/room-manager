"use client";

import { RoomCard } from "@/components/rooms/room-card";
import { RoomFormModal } from "@/components/rooms/room-form-modal";
import { useProperty } from "@/contexts/property-context";
import { useRooms } from "@/hooks/use-rooms";
import { Button, ErrorBlock, Skeleton, Tabs } from "antd-mobile";
import { Plus } from "lucide-react";
import { useState } from "react";
type FilterTab = "all" | "VACANT" | "OCCUPIED";

export default function RoomsPage() {
  const { propertyId } = useProperty();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: rooms, isLoading } = useRooms(propertyId);

  const filteredRooms = rooms?.filter((r) =>
    activeTab === "all" ? true : r.status === activeTab,
  );

  const vacantCount = rooms?.filter((r) => r.status === "VACANT").length ?? 0;
  const occupiedCount =
    rooms?.filter((r) => r.status === "OCCUPIED").length ?? 0;

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
              <Button size="small" color="primary" className="!rounded-[20px]">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm phòng
              </Button>
            }
          />
        )}
      </div>

      {/* Filter tabs */}
      {rooms && rooms.length > 0 && (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as FilterTab)}
          className="[--title-font-size:14px]"
        >
          <Tabs.Tab title={`Tất cả (${rooms.length})`} key="all" />
          <Tabs.Tab title={`Trống (${vacantCount})`} key="VACANT" />
          <Tabs.Tab title={`Đang thuê (${occupiedCount})`} key="OCCUPIED" />
        </Tabs>
      )}

      {/* Room list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-3/5" />
              <Skeleton.Paragraph lineCount={2} animated />
            </div>
          ))}
        </div>
      ) : !propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : filteredRooms?.length === 0 ? (
        <ErrorBlock
          status="empty"
          description={
            activeTab === "all" ? "Chưa có phòng nào" : "Không có phòng"
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredRooms?.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
