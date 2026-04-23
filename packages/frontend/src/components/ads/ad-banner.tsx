'use client';

import { useSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';

interface Props {
  position: 'top' | 'bottom';
}

export function AdBanner({ position }: Props) {
  const { hasRemoveAds } = useSubscription();

  if (hasRemoveAds) return null;

  return (
    <div className={cn('w-full rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant text-xs', position === 'top' ? 'h-12' : 'h-16')}>
      <span>Quảng cáo</span>
    </div>
  );
}
