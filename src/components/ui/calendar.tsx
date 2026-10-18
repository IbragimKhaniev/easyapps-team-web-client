import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ru } from 'date-fns/locale';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const NavIcon = ({ direction }: { direction: 'left' | 'right' }) =>
  direction === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;

/** Календарь: круглые дни, выбранный — залит фирменным, неделя с понедельника. */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn('p-1', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-3',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-[15px] font-bold capitalize text-ink',
        nav: 'flex items-center gap-1',
        nav_button:
          'inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-secondary',
        nav_button_previous: 'absolute left-0',
        nav_button_next: 'absolute right-0',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'w-10 text-[12px] font-semibold uppercase text-ink-faint',
        row: 'mt-1 flex w-full',
        cell: 'relative h-10 w-10 p-0 text-center',
        day: 'inline-flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-ink transition-colors hover:bg-secondary aria-selected:opacity-100',
        day_selected: 'bg-primary text-white hover:bg-primary focus:bg-primary',
        day_today: 'ring-1 ring-inset ring-brand',
        day_outside: 'text-ink-faint opacity-60',
        day_disabled: 'text-ink-faint opacity-40',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <NavIcon direction="left" />,
        IconRight: () => <NavIcon direction="right" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
