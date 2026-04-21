import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ServiceFee {
  id: string;
  propertyId: string;
  name: string;
  calcType: 'FIXED_PER_ROOM' | 'PER_PERSON' | 'PER_QUANTITY';
  unitPrice: number;
  applyTo: 'ALL' | 'SELECTED_ROOMS';
}

export function useServiceFees(propertyId: string) {
  return useQuery<ServiceFee[]>({
    queryKey: ['service-fees', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/service-fees`),
    enabled: !!propertyId,
  });
}

export function useCreateServiceFee(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; calcType: string; unitPrice: number; applyTo: string }) =>
      apiFetch(`/properties/${propertyId}/service-fees`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees', propertyId] });
    },
  });
}

export function useDeleteServiceFee(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/service-fees/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees', propertyId] });
    },
  });
}
