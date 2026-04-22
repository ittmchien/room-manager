import { Tag } from 'antd-mobile';

const STATUS_CONFIG = {
  PAID: { label: 'Đã thanh toán', color: 'success' as const },
  PARTIAL: { label: 'Thu 1 phần', color: 'warning' as const },
  PENDING: { label: 'Chưa thu', color: 'danger' as const },
};

export function InvoiceStatusBadge({ status }: { status: 'PENDING' | 'PARTIAL' | 'PAID' }) {
  const { label, color } = STATUS_CONFIG[status];
  return <Tag color={color}>{label}</Tag>;
}
