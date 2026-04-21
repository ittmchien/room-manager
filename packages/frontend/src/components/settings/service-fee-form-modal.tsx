'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateServiceFee } from '@/hooks/use-service-fees';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

export function ServiceFeeFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [calcType, setCalcType] = useState('FIXED_PER_ROOM');
  const [unitPrice, setUnitPrice] = useState('');
  const create = useCreateServiceFee(propertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({ name, calcType, unitPrice: parseInt(unitPrice) || 0, applyTo: 'ALL' });
      setOpen(false);
      setName('');
      setUnitPrice('');
    } catch {
      // error via create.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Thêm phí dịch vụ</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tên phí</Label>
            <Input required placeholder="Phí vệ sinh..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cách tính</Label>
            <Select value={calcType} onValueChange={setCalcType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_PER_ROOM">Cố định/phòng</SelectItem>
                <SelectItem value="PER_PERSON">Theo người</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Đơn giá (VND)</Label>
            <Input required type="number" min={0} placeholder="50000" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          </div>
          {create.error && <p className="text-sm text-red-500">{(create.error as Error).message}</p>}
          <Button type="submit" className="w-full" disabled={create.isPending}>
            {create.isPending ? 'Đang thêm...' : 'Thêm phí'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
