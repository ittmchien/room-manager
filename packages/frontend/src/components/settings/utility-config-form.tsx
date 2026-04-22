'use client';

import { useState } from 'react';
import { Input, Button, Toast } from 'antd-mobile';
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
      Toast.show({ icon: 'success', content: 'Đã lưu' });
    } catch {
      Toast.show({ icon: 'fail', content: 'Lỗi khi lưu' });
    }
  };

  return (
    <div>
      <p className="mb-1.5 text-sm text-gray-600">{label}</p>
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-gray-50 px-3">
          <Input
            type="number"
            min={0}
            placeholder="Đơn giá (VND)"
            value={unitPrice}
            onChange={setUnitPrice}
            className="[--font-size:15px]"
          />
        </div>
        <Button
          color="primary"
          size="small"
          className="rounded-xl!"
          loading={upsert.isPending}
          onClick={handleSave}
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}
