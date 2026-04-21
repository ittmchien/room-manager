'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFee, useDeleteServiceFee } from '@/hooks/use-service-fees';
import { ServiceFeeFormModal } from './service-fee-form-modal';

const CALC_LABEL: Record<string, string> = {
  FIXED_PER_ROOM: 'Cố định/phòng',
  PER_PERSON: 'Theo người',
  PER_QUANTITY: 'Theo số lượng',
};

interface Props {
  propertyId: string;
  fees: ServiceFee[];
}

export function ServiceFeeList({ propertyId, fees }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteFee = useDeleteServiceFee(propertyId);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteFee.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="space-y-2">
      {fees.map((fee) => (
        <div key={fee.id} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium">{fee.name}</p>
            <p className="text-xs text-gray-500">
              {CALC_LABEL[fee.calcType]} · {fee.unitPrice.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <Button variant="ghost" size="sm" disabled={deletingId === fee.id} onClick={() => handleDelete(fee.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      <ServiceFeeFormModal
        propertyId={propertyId}
        trigger={
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Plus className="h-4 w-4" />
            Thêm phí dịch vụ
          </Button>
        }
      />
    </div>
  );
}
