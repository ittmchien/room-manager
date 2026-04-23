'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from 'antd-mobile';
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
          <Lock className="h-6 w-6 text-on-surface-variant" />
        </div>
        <div>
          <p className="font-semibold text-on-surface">Tính năng trả phí</p>
          <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
        </div>
        <Button color="primary" className="!rounded-xl !px-6" onClick={() => setPremiumOpen(true)}>
          Xem gói bổ sung
        </Button>
      </div>
      <PremiumModal visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}
