import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { FEATURE_KEYS } from '@room-manager/shared';
import { isPremiumEnabled } from '@/lib/features';

export function useFeatures() {
  return useQuery<string[]>({
    queryKey: ['features'],
    queryFn: () => apiFetch('/me/features'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHasFeature(featureKey: string) {
  const { data: features } = useFeatures();
  if (isPremiumEnabled) return true;
  return features?.includes(featureKey) ?? false;
}

export { FEATURE_KEYS };
