import { Check } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export interface IPickerOption<V extends string> {
  value: V;
  label: string;
  icon?: ReactNode;
  hint?: string;
  /** Текст для поиска, если он шире подписи (email, ключ проекта). */
  keywords?: string[];
}

interface IAdaptivePickerProps<V extends string> {
  title: string;
  options: IPickerOption<V>[];
  /** Выбранное: одно значение или несколько (`multiple`). */
  selected: V | V[] | null | undefined;
  multiple?: boolean;
  searchable?: boolean;
  onSelect: (value: V) => void;
  trigger: ReactNode;
  /** Под списком: «Создать метку», «Без срока»… */
  footer?: (close: () => void) => ReactNode;
  align?: 'start' | 'center' | 'end';
  emptyText?: string;
}

const isSelected = <V extends string>(selected: V | V[] | null | undefined, value: V): boolean =>
  Array.isArray(selected) ? selected.includes(value) : selected === value;

/**
 * Выбор из списка, который ведёт себя родно на обоих экранах: на компьютере —
 * всплывающий список с поиском и клавиатурой, на телефоне — шторка снизу со
 * строками как в настройках iOS. Одиночный выбор закрывается сам,
 * множественный — по «Готово».
 */
export const AdaptivePicker = <V extends string>({
  title,
  options,
  selected,
  multiple = false,
  searchable = false,
  onSelect,
  trigger,
  footer,
  align = 'start',
  emptyText = 'Ничего не нашлось',
}: IAdaptivePickerProps<V>) => {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const choose = (value: V) => {
    onSelect(value);
    if (!multiple) close();
  };

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent align={align} className="w-64 rounded-2xl p-1.5 shadow-float">
          <Command>
            {searchable && <CommandInput placeholder="Поиск…" className="h-9" />}
            <CommandList className="max-h-72">
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.keywords?.join(' ') ?? ''} ${option.value}`}
                    onSelect={() => choose(option.value)}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[14px]"
                  >
                    {option.icon}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.hint && <span className="text-xs text-ink-faint">{option.hint}</span>}
                    <Check className={cn('h-4 w-4 text-brand-800', isSelected(selected, option.value) ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          {footer?.(close)}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {multiple && (
            <Button variant="link" className="text-[17px]" onClick={close}>
              Готово
            </Button>
          )}
        </DrawerHeader>
        <Command className="flex min-h-0 flex-1 flex-col bg-transparent">
          {searchable && (
            <div className="px-4 pb-2">
              <CommandInput placeholder="Поиск" className="h-11 rounded-xl bg-secondary px-3 text-[16px]" />
            </div>
          )}
          <CommandList className="max-h-[60dvh] overflow-y-auto px-4 pb-4">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <div className="overflow-hidden rounded-2xl bg-secondary">
              {options.map((option, index) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.keywords?.join(' ') ?? ''} ${option.value}`}
                  onSelect={() => choose(option.value)}
                  className={cn(
                    'flex min-h-[52px] items-center gap-3 rounded-none px-4 text-[17px] data-[selected=true]:bg-black/[0.04]',
                    index > 0 && 'border-t border-black/[0.06]',
                  )}
                >
                  {option.icon}
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.hint && <span className="text-sm text-ink-faint">{option.hint}</span>}
                  {isSelected(selected, option.value) && <Check className="h-5 w-5 text-brand-800" />}
                </CommandItem>
              ))}
            </div>
          </CommandList>
        </Command>
        {footer?.(close)}
      </DrawerContent>
    </Drawer>
  );
};
