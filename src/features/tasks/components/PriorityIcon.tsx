import { TaskPriority } from '@/api/models';
import { PRIORITY_META } from '@/lib/tracker';
import { cn } from '@/lib/utils';

const BAR_HEIGHTS = [5, 8.5, 12];
const FADED = '#D1D5DB';

/** Приоритет: три столбика по силе, срочное — красный квадрат с «!». */
export const PriorityIcon = ({ priority, className }: { priority: TaskPriority; className?: string }) => {
  const meta = PRIORITY_META[priority];

  if (priority === TaskPriority.urgent) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className={cn('shrink-0', className)} role="img" aria-label={meta.label}>
        <rect x="1" y="1" width="14" height="14" rx="4" fill={meta.color} />
        <path d="M8 4.2v4.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="11.4" r="1.15" fill="#fff" />
      </svg>
    );
  }

  if (priority === TaskPriority.none) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" className={cn('shrink-0', className)} role="img" aria-label={meta.label}>
        {[3, 7, 11].map((x) => (
          <rect key={x} x={x} y="7.2" width="2.4" height="1.6" rx="0.8" fill={FADED} />
        ))}
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={cn('shrink-0', className)} role="img" aria-label={meta.label}>
      {BAR_HEIGHTS.map((height, index) => (
        <rect
          key={height}
          x={2.2 + index * 4.3}
          y={14 - height}
          width="3"
          height={height}
          rx="1"
          fill={index < meta.bars ? meta.color : FADED}
        />
      ))}
    </svg>
  );
};
