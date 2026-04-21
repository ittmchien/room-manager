import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface MeterReading {
  id: string;
  roomId: string;
  type: 'ELECTRIC' | 'WATER';
  readingValue: number;
  previousValue: number;
  readingDate: string;
}

export function useMeterReadings(roomId: string, type?: 'ELECTRIC' | 'WATER') {
  return useQuery<MeterReading[]>({
    queryKey: ['meter-readings', roomId, type],
    queryFn: () => apiFetch(`/rooms/${roomId}/meter-readings${type ? `?type=${type}` : ''}`),
    enabled: !!roomId,
  });
}

export function useCreateMeterReading(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: 'ELECTRIC' | 'WATER'; readingValue: number; previousValue: number; readingDate: string }) =>
      apiFetch(`/rooms/${roomId}/meter-readings`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meter-readings', roomId] });
    },
  });
}
