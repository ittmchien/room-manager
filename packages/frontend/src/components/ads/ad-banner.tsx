'use client';

import { useHasFeature, FEATURE_KEYS } from '@/hooks/use-features';

interface Props {
  position: 'top' | 'bottom';
}

export function AdBanner({ position }: Props) {
  const hasRemoveAds = useHasFeature(FEATURE_KEYS.REMOVE_ADS);

  if (hasRemoveAds) return null;

  return (
    <div className={`w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs ${position === 'top' ? 'h-12' : 'h-16'}`}>
      <span>Quảng cáo</span>
    </div>
  );
}
