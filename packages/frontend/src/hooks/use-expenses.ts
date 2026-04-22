import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Expense {
  id: string;
  propertyId: string;
  roomId: string | null;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note: string | null;
  room?: { id: string; name: string } | null;
}

export interface CreateExpenseData {
  propertyId: string;
  roomId?: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note?: string;
}

export function useExpenses(propertyId: string, month?: string) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', propertyId, month],
    queryFn: () =>
      apiFetch(`/properties/${propertyId}/expenses${month ? `?month=${month}` : ''}`),
    enabled: !!propertyId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) =>
      apiFetch('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
