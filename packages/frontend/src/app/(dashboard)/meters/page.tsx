"use client";

import { MeterReadingRow } from "@/components/meters/meter-reading-row";
import { useProperty } from "@/contexts/property-context";
import { useRooms } from "@/hooks/use-rooms";
import { ErrorBlock, Skeleton } from "antd-mobile";

function getCurrentReadingDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function MetersPage() {
  const { propertyId } = useProperty();
  const { data: rooms, isLoading } = useRooms(propertyId);

  const readingDate = getCurrentReadingDate();
  const occupiedRooms = rooms?.filter((r) => r.status === "OCCUPIED") ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Chỉ số điện nước</h1>
        <p className="text-sm text-gray-500">
          Nhập chỉ số kỳ này cho từng phòng
        </p>
      </div>

      {!propertyId ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🏘️</p>
          <p className="mt-3 font-medium">Chưa có khu trọ</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-2/5" />
              <Skeleton.Paragraph lineCount={3} animated />
            </div>
          ))}
        </div>
      ) : occupiedRooms.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có phòng đang thuê" />
      ) : (
        <div className="space-y-3">
          {occupiedRooms.map((room) => (
            <MeterReadingRow
              key={room.id}
              roomId={room.id}
              roomName={room.name}
              readingDate={readingDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
