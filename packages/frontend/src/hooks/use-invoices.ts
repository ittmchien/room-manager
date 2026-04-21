import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface ServiceFeeDetail {
  id: string;
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  roomId: string;
  tenantId: string;
  billingPeriod: string;
  roomFee: number;
  electricFee: number;
  waterFee: number;
  serviceFeesDetail: ServiceFeeDetail[] | null;
  discount: number;
  total: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  dueDate: string | null;
  paidDate: string | null;
  createdAt: string;
  room?: { id: string; name: string };
  tenant?: { id: string; name: string };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: 'CASH' | 'TRANSFER' | 'OTHER';
  note: string | null;
}

export function useInvoices(propertyId: string, billingPeriod?: string) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', propertyId, billingPeriod],
    queryFn: () =>
      apiFetch(`/properties/${propertyId}/invoices${billingPeriod ? `?billingPeriod=${billingPeriod}` : ''}`),
    enabled: !!propertyId,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: () => apiFetch(`/invoices/${id}`),
    enabled: !!id,
  });
}

export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { propertyId: string; billingPeriod: string }) =>
      apiFetch('/invoices/generate', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
