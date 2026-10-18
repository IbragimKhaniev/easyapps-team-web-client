import { TaskStatus } from '@/api/models';
import { STATUS_META } from '@/lib/tracker';
import { cn } from '@/lib/utils';

const SIZE = 18;
const RADIUS = 7;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Доля заливки круга по статусу — прогресс задачи читается с одного взгляда. */
const PROGRESS: Partial<Record<TaskStatus, number>> = {
  [TaskStatus.in_progress]: 0.5,
  [TaskStatus.review]: 0.75,
};

interface IStatusIconProps {
  status: TaskStatus;
  className?: string;
}

/**
 * Иконка статуса в духе Linear: пунктир — бэклог, пустой круг — к работе,
 * заливка по кругу — в работе и на проверке, галочка — готово, крест — отмена.
 */
export const StatusIcon = ({ status, className }: IStatusIconProps) => {
  const color = STATUS_META[status].color;
  const progress = PROGRESS[status];

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox="0 0 18 18"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={STATUS_META[status].label}
    >
      {status === TaskStatus.backlog && (
        <circle cx="9" cy="9" r={RADIUS} fill="none" stroke={color} strokeWidth="1.8" strokeDasharray="2.2 2.2" />
      )}
      {status === TaskStatus.todo && <circle cx="9" cy="9" r={RADIUS} fill="none" stroke={color} strokeWidth="1.8" />}
      {progress !== undefined && (
        <>
          <circle cx="9" cy="9" r={RADIUS} fill="none" stroke={color} strokeWidth="1.8" />
          <circle
            cx="9"
            cy="9"
            r={RADIUS / 2}
            fill="none"
            stroke={color}
            strokeWidth={RADIUS}
            strokeDasharray={`${(CIRCUMFERENCE / 2) * progress} ${CIRCUMFERENCE}`}
            transform="rotate(-90 9 9)"
          />
        </>
      )}
      {status === TaskStatus.done && (
        <>
          <circle cx="9" cy="9" r="8" fill={color} />
          <path d="M5.4 9.2l2.3 2.3 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === TaskStatus.canceled && (
        <>
          <circle cx="9" cy="9" r="8" fill={color} />
          <path d="M6.3 6.3l5.4 5.4M11.7 6.3l-5.4 5.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
