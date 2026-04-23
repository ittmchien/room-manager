"use client";

import { useGenerateInvoices } from "@/hooks/use-invoices";
import {
  useCreateMeterReading,
  useMeterReadings,
} from "@/hooks/use-meter-readings";
import { useRooms } from "@/hooks/use-rooms";
import {
  Button,
  DatePicker,
  ErrorBlock,
  Input,
  Picker,
  Skeleton,
  Toast,
} from "antd-mobile";
import { AppPopup } from "@/components/ui/app-popup";
import { useEffect, useState } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
}

function getBillingPeriod(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function MeterSection({
  label,
  unit,
  previousValue,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  previousValue: number | null;
  value: string;
  onChange: (v: string) => void;
}) {
  const current = parseInt(value);
  const usage =
    !isNaN(current) && previousValue !== null
      ? Math.max(0, current - previousValue)
      : null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <div className="rounded-xl bg-gray-50 px-4 py-3 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Chỉ số cũ</span>
          <span className="font-medium text-gray-900">
            {previousValue !== null ? `${previousValue} ${unit}` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-20 shrink-0">
            Chỉ số mới
          </span>
          <Input
            type="number"
            placeholder="Nhập chỉ số"
            value={value}
            onChange={onChange}
            min={previousValue ?? 0}
            style={{ '--font-size': '15px', '--placeholder-color': '#9ca3af' } as React.CSSProperties}
          />
          <span className="text-sm text-gray-400 shrink-0">{unit}</span>
        </div>
        {usage !== null && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sử dụng</span>
            <span className="font-semibold text-blue-600">
              {usage} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function GenerateInvoiceModal({ visible, onClose, propertyId }: Props) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [electricValue, setElectricValue] = useState("");
  const [waterValue, setWaterValue] = useState("");

  const { data: rooms, isLoading: loadingRooms } = useRooms(propertyId);
  const occupiedRooms = rooms?.filter((r) => r.status === "OCCUPIED") ?? [];

  // Auto-select first occupied room
  useEffect(() => {
    if (occupiedRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(occupiedRooms[0].id);
    }
  }, [occupiedRooms, selectedRoomId]);

  const { data: electricReadings } = useMeterReadings(
    selectedRoomId,
    "ELECTRIC",
  );
  const { data: waterReadings } = useMeterReadings(selectedRoomId, "WATER");
  const previousElectric = electricReadings?.[0]?.readingValue ?? null;
  const previousWater = waterReadings?.[0]?.readingValue ?? null;

  const createMeter = useCreateMeterReading(selectedRoomId);
  const generate = useGenerateInvoices();

  const billingPeriod = getBillingPeriod(selectedDate);
  const readingDate = new Date().toISOString().split("T")[0];

  const reset = () => {
    setElectricValue("");
    setWaterValue("");
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setElectricValue("");
    setWaterValue("");
  };

  const handleSubmit = async () => {
    if (!selectedRoomId) return;

    const electricNum = parseInt(electricValue);
    const waterNum = parseInt(waterValue);

    try {
      // Save meter readings if entered
      if (!isNaN(electricNum) && electricNum >= 0) {
        await createMeter.mutateAsync({
          type: "ELECTRIC",
          readingValue: electricNum,
          previousValue: previousElectric ?? 0,
          readingDate,
        });
      }
      if (!isNaN(waterNum) && waterNum >= 0) {
        await createMeter.mutateAsync({
          type: "WATER",
          readingValue: waterNum,
          previousValue: previousWater ?? 0,
          readingDate,
        });
      }

      // Generate invoice for this room
      await generate.mutateAsync({
        propertyId,
        billingPeriod,
        roomId: selectedRoomId,
      });

      Toast.show({ icon: "success", content: "Đã tạo hóa đơn" });
      reset();
      onClose();
    } catch (err) {
      Toast.show({
        icon: "fail",
        content: (err as Error).message ?? "Lỗi tạo hóa đơn",
      });
    }
  };

  const roomColumns = [
    occupiedRooms.map((r) => ({ label: r.name, value: r.id })),
  ];
  const selectedRoom = occupiedRooms.find((r) => r.id === selectedRoomId);
  const isPending = createMeter.isPending || generate.isPending;

  return (
    <AppPopup
      title="Tạo hóa đơn"
      visible={visible}
      onClose={onClose}
      onSubmit={occupiedRooms.length > 0 ? handleSubmit : undefined}
      submitLabel="Tạo hóa đơn"
      submitLoading={isPending}
      submitDisabled={!selectedRoomId}
      scrollable
    >
      {loadingRooms ? (
        <Skeleton.Paragraph lineCount={4} animated />
      ) : occupiedRooms.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có phòng đang thuê" />
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs text-gray-400">Phòng</p>
            <Picker columns={roomColumns} value={[selectedRoomId]} onConfirm={(val) => handleRoomChange(val[0] as string)}>
              {(items, actions) => (
                <button onClick={actions.open} className="w-full rounded-xl bg-gray-50 px-4 py-3 text-left flex items-center justify-between">
                  <span className="text-[15px] text-gray-900">{selectedRoom?.name ?? "Chọn phòng"}</span>
                  <span className="text-gray-400 text-sm">▾</span>
                </button>
              )}
            </Picker>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-gray-400">Kỳ tháng</p>
            <DatePicker precision="month" value={selectedDate} onConfirm={(val) => setSelectedDate(val)} min={new Date(2020, 0)} max={new Date()} title="Chọn tháng">
              {(_, actions) => (
                <button onClick={actions.open} className="w-full rounded-xl bg-gray-50 px-4 py-3 text-left flex items-center justify-between">
                  <span className="text-[15px] text-gray-900">Tháng {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}</span>
                  <span className="text-gray-400 text-sm">▾</span>
                </button>
              )}
            </DatePicker>
          </div>
          <MeterSection label="Điện" unit="kWh" previousValue={previousElectric} value={electricValue} onChange={setElectricValue} />
          <MeterSection label="Nước" unit="m³" previousValue={previousWater} value={waterValue} onChange={setWaterValue} />
        </div>
      )}
    </AppPopup>
  );
}
