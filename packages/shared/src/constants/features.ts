export const FEATURE_KEYS = {
  ROOMS_SLOT: 'rooms_slot',
  ROOMS_50: 'rooms_50',
  MULTI_PROPERTY: 'multi_property',
  CONTRACTS: 'contracts',
  FINANCIAL_REPORTS: 'financial_reports',
  EXPENSES: 'expenses',
  REMOVE_ADS: 'remove_ads',
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export const FREE_ROOM_LIMIT = 10;
export const FREE_PROPERTY_LIMIT = 1;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
