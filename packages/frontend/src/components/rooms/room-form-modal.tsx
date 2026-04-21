'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rentPrice) return;

    await createRoom.mutateAsync({
      name,
      floor: floor ? parseInt(floor) : undefined,
      rentPrice: parseInt(rentPrice),
    });

    setName('');
    setFloor('');
    setRentPrice('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-2">
            <Label>Tên/Số phòng</Label>
            <Input
              placeholder="VD: Phòng 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Tầng (tuỳ chọn)</Label>
            <Input
              type="number"
              placeholder="1"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Giá thuê/tháng (VNĐ)</Label>
            <Input
              type="number"
              placeholder="2000000"
              value={rentPrice}
              onChange={(e) => setRentPrice(e.target.value)}
              required
              min={0}
            />
          </div>
          {createRoom.error && (
            <p className="text-sm text-red-500">{(createRoom.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={createRoom.isPending}>
            {createRoom.isPending ? 'Đang thêm...' : 'Thêm phòng'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
