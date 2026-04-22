'use client';

import { Plus } from 'lucide-react';
import { Button, ErrorBlock, Skeleton } from 'antd-mobile';
import { useContracts } from '@/hooks/use-contracts';
import { useProperty } from '@/contexts/property-context';
import { ContractCard } from '@/components/contracts/contract-card';
import { ContractFormModal } from '@/components/contracts/contract-form-modal';

export default function ContractsPage() {
  const { propertyId } = useProperty();
  const { data: contracts, isLoading } = useContracts(propertyId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hợp đồng</h1>
          {contracts && (
            <p className="text-sm text-gray-400">{contracts.length} hợp đồng</p>
          )}
        </div>
        {propertyId && (
          <ContractFormModal
            propertyId={propertyId}
            trigger={
              <Button size="small" color="primary" className="!rounded-[20px]">
                <Plus className="mr-1 h-4 w-4 inline" />
                Thêm
              </Button>
            }
          />
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <Skeleton.Title animated className="w-3/5" />
              <Skeleton.Paragraph lineCount={2} animated />
            </div>
          ))}
        </div>
      ) : !propertyId ? (
        <ErrorBlock status="empty" description="Chưa có khu trọ" />
      ) : contracts?.length === 0 ? (
        <ErrorBlock status="empty" description="Chưa có hợp đồng nào" />
      ) : (
        <div className="space-y-3">
          {contracts?.map((c) => <ContractCard key={c.id} contract={c} />)}
        </div>
      )}
    </div>
  );
}
