'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtilityConfig, useUpsertUtilityConfig } from '@/hooks/use-utility-configs';

interface Props {
  propertyId: string;
  type: 'ELECTRIC' | 'WATER';
  config?: UtilityConfig;
  label: string;
}

export function UtilityConfigForm({ propertyId, type, config, label }: Props) {
  const [unitPrice, setUnitPrice] = useState(config?.unitPrice?.toString() ?? '');
  const upsert = useUpsertUtilityConfig(propertyId);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ type, data: { calcType: 'FIXED', unitPrice: parseInt(unitPrice) || 0 } });
    } catch {
      // error via upsert.error
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          min={0}
          placeholder="Đơn giá (VND)"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="max-w-xs"
        />
        <Button size="sm" onClick={handleSave} disabled={upsert.isPending}>
          {upsert.isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
      {upsert.isSuccess && <p className="text-xs text-green-600">Đã lưu</p>}
      {upsert.error && <p className="text-xs text-red-500">{(upsert.error as Error).message}</p>}
    </div>
  );
}
