'use client';

import { useState } from 'react';
import { useCreateRoom } from '@/hooks/use-rooms';
import { AppPopup } from '@/components/ui/app-popup';
import { FormInput } from '@/components/ui/form-field';

interface RoomFormModalProps {
  propertyId: string;
  trigger: React.ReactNode;
}

export function RoomFormModal({ propertyId, trigger }: RoomFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const createRoom = useCreateRoom(propertyId);

  const reset = () => { setName(''); setFloor(''); setRentPrice(''); };

  const handleSubmit = async () => {
    if (!name || !rentPrice) return;
    try {
      await createRoom.mutateAsync({
        name,
        floor: floor ? parseInt(floor) : undefined,
        rentPrice: parseInt(rentPrice),
      });
      reset();
      setOpen(false);
    } catch {}
  };

  return (
    <AppPopup
      title="Thêm phòng mới"
      visible={open}
      trigger={trigger}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); reset(); }}
      onSubmit={handleSubmit}
      submitLabel="Thêm phòng"
      submitLoading={createRoom.isPending}
      submitDisabled={!name || !rentPrice}
      error={createRoom.error ? (createRoom.error as Error).message : null}
    >
      <div className="space-y-4">
        <FormInput label="Tên / Số phòng *" placeholder="VD: Phòng 101" value={name} onChange={setName} />
        <FormInput label="Tầng (tuỳ chọn)" type="number" placeholder="1" value={floor} onChange={setFloor} />
        <FormInput label="Giá thuê/tháng (VNĐ) *" type="number" placeholder="2.000.000" value={rentPrice} onChange={setRentPrice} />
      </div>
    </AppPopup>
  );
}
