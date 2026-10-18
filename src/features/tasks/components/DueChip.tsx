import { CalendarDays } from 'lucide-react';

import { dueLabel, type TDueTone } from '@/lib/dates';
import { cn } from '@/lib/utils';

const TONES: Record<TDueTone, string> = {
  overdue: 'border-rose-200 bg-rose-50 text-rose-600',
  today: 'border-amber-200 bg-amber-50 text-amber-700',
  soon: 'border-brand-200 bg-brand-50 text-brand-800',
  later: 'border-black/10 bg-white text-ink-muted',
};

interface IDueChipProps {
  dueDate: string;
  today: string;
  /** Закрытым задачам срок уже не горит. */
  muted?: boolean;
  className?: string;
}

/** Срок задачи: краснеет, когда просрочен, жёлтый — сегодня. */
export const DueChip = ({ dueDate, today, muted = false, className }: IDueChipProps) => {
  const { text, tone } = dueLabel(dueDate, today);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-semibold',
        muted ? TONES.later : TONES[tone],
        className,
      )}
    >
      <CalendarDays className="h-3.5 w-3.5" />
      {text}
    </span>
  );
};
