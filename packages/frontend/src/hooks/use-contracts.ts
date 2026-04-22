import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string | null;
  depositAmount: number;
  depositStatus: 'PENDING' | 'PAID' | 'RETURNED' | 'DEDUCTED';
  terms: string | null;
  createdAt: string;
  room?: { id: string; name: string };
  tenant?: { id: string; name: string };
}

export interface CreateContractData {
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  depositAmount?: number;
  depositStatus?: Contract['depositStatus'];
  terms?: string;
}

export function useContracts(propertyId: string) {
  return useQuery<Contract[]>({
    queryKey: ['contracts', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/contracts`),
    enabled: !!propertyId,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContractData) =>
      apiFetch('/contracts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useUpdateContract(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateContractData>) =>
      apiFetch(`/contracts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/contracts/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });
}
