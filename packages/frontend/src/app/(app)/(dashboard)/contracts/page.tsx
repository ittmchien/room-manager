'use client';

import { Plus } from 'lucide-react';
import { ErrorBlock, Skeleton } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { useContracts } from '@/hooks/use-contracts';
import { useProperty } from '@/contexts/property-context';
import { ContractCard } from '@/components/contracts/contract-card';
import { ContractFormModal } from '@/components/contracts/contract-form-modal';
import { FeatureGate } from '@/components/ui/feature-gate';
import { useSubscription } from '@/hooks/use-subscription';

function ContractBody({ propertyId }: { propertyId: string }) {
  const { data: contracts, isPending } = useContracts(propertyId);

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
            <Skeleton.Title animated className="w-3/5" />
            <Skeleton.Paragraph lineCount={2} animated />
          </div>
        ))}
      </div>
    );
  }

  if (!contracts?.length) {
    return <ErrorBlock status="empty" title="Chưa có hợp đồng" description="Thêm hợp đồng để theo dõi thỏa thuận với người thuê" />;
  }

  return (
    <div className="space-y-3">
      {contracts.map((c) => <ContractCard key={c.id} contract={c} />)}
    </div>
  );
}

export default function ContractsPage() {
  const { propertyId } = useProperty();
  const { canContracts } = useSubscription();

  return (
    <FeatureGate locked={!canContracts} description="Quản lý hợp đồng và tiền cọc cần mua tính năng Hợp đồng.">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Hợp đồng</h1>
          {propertyId && (
            <ContractFormModal
              propertyId={propertyId}
              trigger={
                <Button size="small" color="primary">
                  <Plus className="mr-1 h-4 w-4 inline" />
                  Thêm
                </Button>
              }
            />
          )}
        </div>

        {!propertyId
          ? <ErrorBlock status="empty" description="Chưa có khu trọ" />
          : <ContractBody propertyId={propertyId} />
        }
      </div>
    </FeatureGate>
  );
}
