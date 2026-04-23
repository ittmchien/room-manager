/**
 * Stitch "Modern Sanctuary" design tokens for JS usage.
 * Maps room/invoice statuses to the Material Design 3 semantic colors.
 */

export const roomStatusStyles = {
  OCCUPIED: {
    label: 'Đang thuê',
    bar: 'bg-secondary-fixed',
    badge: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  VACANT: {
    label: 'Trống',
    bar: 'bg-surface-variant',
    badge: 'bg-surface-variant text-on-surface-variant',
  },
  MAINTENANCE: {
    label: 'Đang sửa',
    bar: 'bg-tertiary-fixed',
    badge: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
} as const;

export const invoiceStatusStyles = {
  PAID: {
    label: 'Đã đóng',
    badge: 'bg-secondary-fixed text-on-secondary-fixed',
  },
  PENDING: {
    label: 'Chưa đóng',
    badge: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  OVERDUE: {
    label: 'Quá hạn',
    badge: 'bg-error-container text-on-error-container',
  },
} as const;

export const attentionItemStyles = {
  debt: { bar: 'bg-error', icon: 'payments' },
  repair: { bar: 'bg-tertiary', icon: 'build' },
  expiring: { bar: 'bg-surface-variant', icon: 'event_busy' },
} as const;
