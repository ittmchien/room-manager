import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalBilled: number;
  totalCollected: number;
  totalExpenses: number;
  totalOtherIncome: number;
  profit: number;
  invoiceCount: number;
  paidCount: number;
}

export interface PropertySnapshot {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  currentPeriod: string;
  totalBilledThisMonth: number;
  totalCollectedThisMonth: number;
  pendingCount: number;
}

export function useMonthlyReport(propertyId: string, year: number) {
  return useQuery<MonthlyReport[]>({
    queryKey: ['reports', 'monthly', propertyId, year],
    queryFn: () => apiFetch(`/properties/${propertyId}/reports/monthly?year=${year}`),
    enabled: !!propertyId,
  });
}

export function usePropertySnapshot(propertyId: string) {
  return useQuery<PropertySnapshot>({
    queryKey: ['reports', 'snapshot', propertyId],
    queryFn: () => apiFetch(`/properties/${propertyId}/reports/snapshot`),
    enabled: !!propertyId,
  });
}
