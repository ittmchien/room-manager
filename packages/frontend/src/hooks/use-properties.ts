'use client';

import { useQuery } from '@tanstack/react-query';
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
