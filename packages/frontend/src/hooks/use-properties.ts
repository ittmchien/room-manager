'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Property {
  id: string;
  name: string;
  address: string | null;
  _count: { rooms: number };
}

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => apiFetch<Property[]>('/properties'),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; address?: string }) =>
      apiFetch<Property>('/properties', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}
