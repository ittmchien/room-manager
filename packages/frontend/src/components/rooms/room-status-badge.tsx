import { cn } from '@/lib/utils';
import { roomStatusStyles } from '@/lib/design-tokens';

type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const cfg = roomStatusStyles[status];
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full font-label text-[0.6875rem] font-medium uppercase tracking-wider',
      cfg.badge
    )}>
      {cfg.label}
    </span>
  );
}
