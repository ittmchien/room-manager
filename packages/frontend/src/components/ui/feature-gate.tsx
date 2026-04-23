'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumModal } from '@/components/premium/premium-modal';

interface FeatureGateProps {
  children: React.ReactNode;
  locked: boolean;
  description?: string;
}

export function FeatureGate({ children, locked, description = 'Tính năng này cần mua thêm gói bổ sung.' }: FeatureGateProps) {
  const [premiumOpen, setPremiumOpen] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-700">Tính năng trả phí</p>
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        </div>
        <Button color="primary" className="!px-6" onClick={() => setPremiumOpen(true)}>
          Xem gói bổ sung
        </Button>
      </div>
      <PremiumModal visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}
