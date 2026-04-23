'use client';

import { isPremiumEnabled } from '@/lib/features';
import { FEATURE_KEYS } from '@room-manager/shared';

export interface SubscriptionInfo {
  /** Tài khoản có đang ở trạng thái premium không */
  isPremium: boolean;
  /** Gói đang dùng */
  plan: 'free' | 'basic' | 'pro' | 'custom';
  // Per-feature flags
  canMultiProperty: boolean;
  canContracts: boolean;
  canExpenses: boolean;
  canReports: boolean;
  hasRemoveAds: boolean;
}

/**
 * Hook lấy thông tin premium/subscription của tài khoản.
 * TODO: thay thế bằng query thực tế từ backend — GET /me/subscription
 * Backend trả về { plan, features: string[] } rồi map vào các flag bên dưới.
 */
export function useSubscription(): SubscriptionInfo {
  // Tạm thời dựa vào env flag — khi có API thay bằng useQuery
  const premium = isPremiumEnabled;

  return {
    isPremium: premium,
    plan: premium ? 'pro' : 'free',
    canMultiProperty: premium,
    canContracts: premium,
    canExpenses: premium,
    canReports: premium,
    hasRemoveAds: premium,
  };
}

export { FEATURE_KEYS };
