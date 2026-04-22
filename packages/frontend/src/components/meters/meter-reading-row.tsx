'use client';

import { useState } from 'react';
import { Card, Input, Button, Toast } from 'antd-mobile';
import { useCreateMeterReading, useMeterReadings } from '@/hooks/use-meter-readings';

function TypeInput({
  roomId, type, label, readingDate,
}: {
  roomId: string; type: 'ELECTRIC' | 'WATER'; label: string; readingDate: string;
}) {
  const { data: readings } = useMeterReadings(roomId, type);
  const latestReading = readings?.[0];
  const [value, setValue] = useState('');
  const create = useCreateMeterReading(roomId);

  const handleSave = async () => {
    const readingValue = parseInt(value);
    if (!readingValue || isNaN(readingValue)) return;
    try {
      await create.mutateAsync({
        type, readingValue,
        previousValue: latestReading?.readingValue ?? 0,
        readingDate,
      });
      setValue('');
      Toast.show({ icon: 'success', content: 'Đã lưu' });
    } catch {
      Toast.show({ icon: 'fail', content: 'Lỗi khi lưu' });
    }
  };

  return (
    <div className="flex-1">
      <p className="mb-1 text-xs text-gray-400">
        {label}: {latestReading ? `Kỳ trước: ${latestReading.readingValue}` : 'Chưa có'}
      </p>
      <div className="flex gap-1">
        <Input
          type="number"
          placeholder="Chỉ số mới"
          value={value}
          onChange={setValue}
          min={latestReading?.readingValue ?? 0}
          style={{ '--font-size': '14px' } as React.CSSProperties}
          className="!bg-gray-100 !rounded-lg !px-2.5 !py-1.5"
        />
        <Button
          size="small"
          color="primary"
          disabled={!value || create.isPending}
          onClick={handleSave}
          className="!rounded-lg !min-w-9"
        >
          ✓
        </Button>
      </div>
    </div>
  );
}

export function MeterReadingRow({ roomId, roomName, readingDate }: { roomId: string; roomName: string; readingDate: string }) {
  return (
    <Card
      style={{ '--border-radius': '16px' }}
      bodyStyle={{ padding: '12px 16px' }}
    >
      <p className="mb-3 font-semibold text-gray-900">{roomName}</p>
      <div className="flex gap-3">
        <TypeInput roomId={roomId} type="ELECTRIC" label="Điện (kWh)" readingDate={readingDate} />
        <TypeInput roomId={roomId} type="WATER" label="Nước (m³)" readingDate={readingDate} />
      </div>
    </Card>
  );
}
