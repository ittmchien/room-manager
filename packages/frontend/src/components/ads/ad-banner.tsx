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
    <div className={cn('w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs', position === 'top' ? 'h-12' : 'h-16')}>
      <span>Quảng cáo</span>
    </div>
  );
}
