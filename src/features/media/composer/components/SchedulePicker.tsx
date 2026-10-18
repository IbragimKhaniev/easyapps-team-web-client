import { CalendarDays, Clock } from 'lucide-react';

import { DueDatePicker } from '@/features/tasks/pickers/DueDatePicker';
import { formatLongDate } from '@/lib/dates';
import { fieldClassName } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ISchedulePickerProps {
  date: string;
  time: string;
  disabled?: boolean;
  onDate: (date: string) => void;
  onTime: (time: string) => void;
}

/** День плана и время выхода (время — в поясе человека). */
export const SchedulePicker = ({ date, time, disabled, onDate, onTime }: ISchedulePickerProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <DueDatePicker
      value={date}
      onChange={(value) => value && onDate(value)}
      trigger={
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-brand-50 disabled:opacity-60"
        >
          <CalendarDays className="h-4 w-4 text-brand-800" />
          {formatLongDate(date)}
        </button>
      }
    />
    <label className="relative">
      <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-800" />
      <input
        type="time"
        value={time}
        step={300}
        disabled={disabled}
        onChange={(event) => event.target.value && onTime(event.target.value)}
        className={cn(fieldClassName, 'h-11 w-[148px] pl-10 font-semibold tabular')}
        aria-label="Время публикации"
      />
    </label>
  </div>
);
