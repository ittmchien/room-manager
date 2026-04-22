import { Tag } from 'antd-mobile';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

const statusConfig: Record<RoomStatus, { label: string; color: 'primary' | 'success' | 'warning' }> = {
  OCCUPIED: { label: 'Đang thuê', color: 'success' },
  VACANT: { label: 'Trống', color: 'primary' },
  MAINTENANCE: { label: 'Sửa chữa', color: 'warning' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const { label, color } = statusConfig[status];
  return <Tag color={color}>{label}</Tag>;
}
