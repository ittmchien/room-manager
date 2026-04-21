'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  floor: number | null;
  rentPrice: number;
  rentCalcType: 'FIXED' | 'PER_PERSON';
  rentPerPersonPrice: number | null;
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
  tenants: { id: string; name: string; phone: string | null }[];
  _count: { tenants: number };
}

export interface CreateRoomInput {
  name: string;
  floor?: number;
  rentPrice: number;
  rentCalcType?: 'FIXED' | 'PER_PERSON';
  rentPerPersonPrice?: number;
}

export interface UpdateRoomInput {
  name?: string;
  floor?: number;
  rentPrice?: number;
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
}

export function useRooms(propertyId: string) {
  return useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: () => apiFetch<Room[]>(`/properties/${propertyId}/rooms`),
    enabled: !!propertyId,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => apiFetch<Room>(`/rooms/${id}`),
    enabled: !!id,
  });
}

export function useCreateRoom(propertyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomInput) =>
      apiFetch<Room>(`/properties/${propertyId}/rooms`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomInput }) =>
      apiFetch<Room>(`/rooms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['room', id] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
