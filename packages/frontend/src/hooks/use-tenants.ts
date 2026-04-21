'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Tenant {
  id: string;
  roomId: string;
  name: string;
  phone: string | null;
  idCard: string | null;
  moveInDate: string;
  moveOutDate: string | null;
  status: 'ACTIVE' | 'MOVED_OUT';
}

export interface CreateTenantInput {
  name: string;
  phone?: string;
  idCard?: string;
  idCardImage?: string;
  moveInDate: string;
}

export function useTenants(roomId: string) {
  return useQuery({
    queryKey: ['tenants', roomId],
    queryFn: () => apiFetch<Tenant[]>(`/rooms/${roomId}/tenants`),
    enabled: !!roomId,
  });
}

export function useCreateTenant(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTenantInput) =>
      apiFetch<Tenant>(`/rooms/${roomId}/tenants`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useCheckoutTenant(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tenantId: string) =>
      apiFetch<Tenant>(`/tenants/${tenantId}/checkout`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants', roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
