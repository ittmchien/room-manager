'use client';

import { useState } from 'react';
import { Input, Selector } from 'antd-mobile';
import { useCreateServiceFee } from '@/hooks/use-service-fees';
import { AppPopup } from '@/components/ui/app-popup';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const CALC_OPTIONS = [
  { label: 'Cố định/phòng', value: 'FIXED_PER_ROOM' },
  { label: 'Theo người', value: 'PER_PERSON' },
];

export function ServiceFeeFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [calcType, setCalcType] = useState<string[]>(['FIXED_PER_ROOM']);
  const [unitPrice, setUnitPrice] = useState('');
  const create = useCreateServiceFee(propertyId);

  const handleSubmit = async () => {
    if (!name || !unitPrice) return;
    try {
      await create.mutateAsync({
        name,
        calcType: calcType[0] ?? 'FIXED_PER_ROOM',
        unitPrice: parseInt(unitPrice) || 0,
        applyTo: 'ALL',
      });
      setOpen(false);
      setName(''); setUnitPrice('');
    } catch {}
  };

  return (
    <AppPopup
      title="Thêm phí dịch vụ"
      visible={open}
      trigger={trigger}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onSubmit={handleSubmit}
      submitLabel="Thêm phí"
      submitLoading={create.isPending}
      submitDisabled={!name || !unitPrice}
      error={create.error ? (create.error as Error).message : null}
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Tên phí *</p>
          <Input placeholder="Phí vệ sinh..." value={name} onChange={setName} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Cách tính</p>
          <Selector options={CALC_OPTIONS} value={calcType} onChange={setCalcType} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Đơn giá (VND) *</p>
          <Input type="number" placeholder="50.000" value={unitPrice} onChange={setUnitPrice} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
      </div>
    </AppPopup>
  );
}
