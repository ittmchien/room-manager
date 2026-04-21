import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export function useCreatePayment(invoiceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { amount: number; paymentDate: string; method: string; note?: string }) =>
      apiFetch(`/invoices/${invoiceId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
