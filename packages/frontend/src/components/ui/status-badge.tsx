import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  className: string;
  dot?: string;
}

export function StatusBadge({ label, className, dot }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
      {label}
    </span>
  );
}
