'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePayment } from '@/hooks/use-payments';

interface Props {
  invoiceId: string;
  remaining: number;
  trigger: React.ReactNode;
}

export function PaymentFormModal({ invoiceId, remaining, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining.toString());
  const [method, setMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const createPayment = useCreatePayment(invoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync({
        amount: parseInt(amount),
        paymentDate: new Date().toISOString().split('T')[0],
        method,
        note: note || undefined,
      });
      setOpen(false);
    } catch {
      // error via createPayment.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Ghi nhận thanh toán</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Số tiền (VND)</Label>
            <Input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hình thức</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Tiền mặt</SelectItem>
                <SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
                <SelectItem value="OTHER">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ghi chú (không bắt buộc)</Label>
            <Input placeholder="Ghi chú..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {createPayment.error && <p className="text-sm text-red-500">{(createPayment.error as Error).message}</p>}
          <Button type="submit" className="w-full" disabled={createPayment.isPending}>
            {createPayment.isPending ? 'Đang ghi nhận...' : 'Ghi nhận'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
