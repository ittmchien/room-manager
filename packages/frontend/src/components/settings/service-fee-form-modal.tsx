'use client';

import { useState } from 'react';
import { useCreateServiceFee } from '@/hooks/use-service-fees';
import { AppPopup } from '@/components/ui/app-popup';
import { FormInput } from '@/components/ui/form-field';
import { SelectorField } from '@/components/ui/selector-field';

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
        <FormInput label="Tên phí *" placeholder="Phí vệ sinh..." value={name} onChange={setName} />
        <SelectorField label="Cách tính" options={CALC_OPTIONS} value={calcType} onChange={setCalcType} />
        <FormInput label="Đơn giá (VND) *" type="number" placeholder="50.000" value={unitPrice} onChange={setUnitPrice} />
      </div>
    </AppPopup>
  );
}
