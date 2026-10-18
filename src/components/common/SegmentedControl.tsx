import { motion } from 'framer-motion';
import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ISegment<V extends string> {
  value: V;
  label: ReactNode;
}

interface ISegmentedControlProps<V extends string> {
  segments: ISegment<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/** Переключатель как в iOS: белая «таблетка» переезжает к выбранному сегменту. */
export const SegmentedControl = <V extends string>({ segments, value, onChange, className, size = 'md' }: ISegmentedControlProps<V>) => {
  const layoutId = useId();
  return (
    <div className={cn('inline-flex rounded-full bg-black/[0.05] p-1', className)} role="tablist">
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(segment.value)}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-bold transition-colors [&_svg]:h-4 [&_svg]:w-4',
              size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-4 text-[14px]',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-white shadow-card"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
};
