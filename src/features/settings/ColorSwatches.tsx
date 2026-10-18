import { Check } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TRACKER_PALETTE } from '@/lib/tracker';
import { cn } from '@/lib/utils';

interface IColorSwatchesProps {
  value: string;
  onChange: (color: string) => void;
  /** Компактно: одна точка, по нажатию — палитра. */
  compact?: boolean;
}

const Swatches = ({ value, onChange }: Omit<IColorSwatchesProps, 'compact'>) => (
  <div className="flex flex-wrap gap-2">
    {TRACKER_PALETTE.map((color) => (
      <button
        key={color}
        type="button"
        onClick={() => onChange(color)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 transition-transform hover:scale-110"
        style={{ background: color }}
        aria-label={color}
      >
        {value.toUpperCase() === color.toUpperCase() && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
      </button>
    ))}
  </div>
);

/** Цвет только из палитры трекера — сервер другой не примет. */
export const ColorSwatches = ({ value, onChange, compact = false }: IColorSwatchesProps) => {
  if (!compact) return <Swatches value={value} onChange={onChange} />;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={cn('h-6 w-6 shrink-0 rounded-full ring-2 ring-white shadow-card')} style={{ background: value }} aria-label="Цвет" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[232px] rounded-2xl p-3">
        <Swatches value={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};
