'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateMeterReading, useMeterReadings } from '@/hooks/use-meter-readings';

function TypeInput({
  roomId,
  type,
  label,
  readingDate,
}: {
  roomId: string;
  type: 'ELECTRIC' | 'WATER';
  label: string;
  readingDate: string;
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
        type,
        readingValue,
        previousValue: latestReading?.readingValue ?? 0,
        readingDate,
      });
      setValue('');
    } catch {
      // error via create.error
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">
        {label}: {latestReading ? `Kỳ trước: ${latestReading.readingValue}` : 'Chưa có'}
      </p>
      <div className="flex gap-1">
        <Input
          type="number"
          min={latestReading?.readingValue ?? 0}
          placeholder="Chỉ số mới"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2"
          disabled={!value || create.isPending}
          onClick={handleSave}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
      {create.error && <p className="text-xs text-red-500">{(create.error as Error).message}</p>}
    </div>
  );
}

export function MeterReadingRow({ roomId, roomName, readingDate }: { roomId: string; roomName: string; readingDate: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <p className="font-medium">{roomName}</p>
      <div className="grid grid-cols-2 gap-3">
        <TypeInput roomId={roomId} type="ELECTRIC" label="Điện (kWh)" readingDate={readingDate} />
        <TypeInput roomId={roomId} type="WATER" label="Nước (m³)" readingDate={readingDate} />
      </div>
    </div>
  );
}
