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
import { useCreateTenant } from '@/hooks/use-tenants';

interface TenantFormModalProps {
  roomId: string;
  trigger: React.ReactNode;
}

export function TenantFormModal({ roomId, trigger }: TenantFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const createTenant = useCreateTenant(roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !moveInDate) return;

    try {
      await createTenant.mutateAsync({
        name,
        phone: phone || undefined,
        idCard: idCard || undefined,
        moveInDate,
      });
      setName('');
      setPhone('');
      setIdCard('');
      setMoveInDate(new Date().toISOString().split('T')[0]);
      setOpen(false);
    } catch {
      // Error displayed via createTenant.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm người thuê</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Số CCCD (tuỳ chọn)</Label>
            <Input
              placeholder="001234567890"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Ngày vào</Label>
            <Input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              required
            />
          </div>
          {createTenant.error && (
            <p className="text-sm text-red-500">{(createTenant.error as Error).message}</p>
          )}
          <Button type="submit" className="w-full" disabled={createTenant.isPending}>
            {createTenant.isPending ? 'Đang thêm...' : 'Thêm người thuê'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
