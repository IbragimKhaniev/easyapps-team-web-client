import { CalendarX, Sun, Sunrise, CalendarRange } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { addDaysIso, isoDateToLocal, localDateToIso, todayIso } from '@/lib/dates';

interface IDueDatePickerProps {
  value: string | null;
  onChange: (dueDate: string | null) => void;
  trigger: ReactNode;
}

const WEEK = 7;

/** Срок: быстрые варианты («Сегодня», «Завтра», «Через неделю») и календарь. */
export const DueDatePicker = ({ value, onChange, trigger }: IDueDatePickerProps) => {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const today = todayIso();

  const pick = (dueDate: string | null) => {
    onChange(dueDate);
    setOpen(false);
  };

  const quick = [
    { label: 'Сегодня', icon: Sun, value: today },
    { label: 'Завтра', icon: Sunrise, value: addDaysIso(today, 1) },
    { label: 'Через неделю', icon: CalendarRange, value: addDaysIso(today, WEEK) },
    { label: 'Без срока', icon: CalendarX, value: null },
  ];

  const body = (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {quick.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => pick(option.value)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-brand-50"
          >
            <option.icon className="h-4 w-4 text-brand-800" />
            {option.label}
          </button>
        ))}
      </div>
      <Calendar
        mode="single"
        selected={value ? isoDateToLocal(value) : undefined}
        defaultMonth={value ? isoDateToLocal(value) : undefined}
        onSelect={(date) => date && pick(localDateToIso(date))}
        className="mx-auto"
      />
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align="start" className="w-[316px] rounded-2xl p-3 shadow-float">
          {body}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Срок</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">{body}</div>
      </DrawerContent>
    </Drawer>
  );
};
