'use client';

import { useState } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreateServiceFee } from '@/hooks/use-service-fees';

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
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => setOpen(false)}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thêm phí dịch vụ</h3>
            <Button fill="none" size="small" onClick={() => setOpen(false)} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tên phí *</p>
              <Input placeholder="Phí vệ sinh..." value={name} onChange={setName}
                className="[--font-size:15px]" />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Cách tính</p>
              <Selector
                options={CALC_OPTIONS}
                value={calcType}
                onChange={setCalcType}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Đơn giá (VND) *</p>
              <Input type="number" placeholder="50.000" value={unitPrice} onChange={setUnitPrice}
                className="[--font-size:15px]" />
            </div>
          </div>

          {create.error && (
            <p className="mt-3 text-sm text-red-500">{(create.error as Error).message}</p>
          )}

          <Button block color="primary" size="large" className="mt-5 rounded-xl!"
            loading={create.isPending} disabled={!name || !unitPrice} onClick={handleSubmit}>
            Thêm phí
          </Button>
        </div>
      </Popup>
    </>
  );
}
