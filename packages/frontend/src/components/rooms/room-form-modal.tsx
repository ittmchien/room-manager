'use client';

import { useState } from 'react';
import { Popup, Button, Input } from 'antd-mobile';
import { useCreateRoom } from '@/hooks/use-rooms';

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

  const handleSubmit = async () => {
    if (!name || !rentPrice) return;
    try {
      await createRoom.mutateAsync({
        name,
        floor: floor ? parseInt(floor) : undefined,
        rentPrice: parseInt(rentPrice),
      });
      setName(''); setFloor(''); setRentPrice('');
      setOpen(false);
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
            <h3 className="text-lg font-bold">Thêm phòng mới</h3>
            <Button fill="none" size="small" onClick={() => setOpen(false)} className="!text-gray-400">Đóng</Button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tên / Số phòng *</p>
              <Input
                placeholder="VD: Phòng 101"
                value={name}
                onChange={setName}
                className="[--font-size:15px]"
              />
            </div>
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tầng (tuỳ chọn)</p>
              <Input
                type="number"
                placeholder="1"
                value={floor}
                onChange={setFloor}
                className="[--font-size:15px]"
              />
            </div>
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Giá thuê/tháng (VNĐ) *</p>
              <Input
                type="number"
                placeholder="2.000.000"
                value={rentPrice}
                onChange={setRentPrice}
                className="[--font-size:15px]"
              />
            </div>
          </div>

          {createRoom.error && (
            <p className="mt-3 text-sm text-red-500">{(createRoom.error as Error).message}</p>
          )}

          <Button
            block
            color="primary"
            size="large"
            className="mt-5 rounded-xl!"
            loading={createRoom.isPending}
            disabled={!name || !rentPrice}
            onClick={handleSubmit}
          >
            Thêm phòng
          </Button>
        </div>
      </Popup>
    </>
  );
}
