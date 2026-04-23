import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface TierConfig {
  fromKwh: number;
  toKwh: number | null;
  pricePerKwh: number;
}

export interface UtilityConfig {
  id: string;
  propertyId: string;
  type: 'ELECTRIC' | 'WATER';
  calcType: string;
  unitPrice: number | null;
  perPersonPrice: number | null;
  fixedRoomPrice: number | null;
  tiers?: TierConfig[] | null;
}

export interface UpsertUtilityConfigData {
  calcType: string;
  unitPrice?: number;
  perPersonPrice?: number;
  fixedRoomPrice?: number;
  tiers?: TierConfig[];
}

export function useUtilityConfigs(propertyId: string) {
  return useQuery<UtilityConfig[]>({
    queryKey: ['utility-configs', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/utility-configs`),
    enabled: !!propertyId,
  });
}

export function useUpsertUtilityConfig(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }: { type: 'ELECTRIC' | 'WATER'; data: UpsertUtilityConfigData }) =>
      apiFetch(`/properties/${propertyId}/utility-configs/${type}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-configs', propertyId] });
    },
  });
}
