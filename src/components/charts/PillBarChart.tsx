import { cn } from '@/lib/utils';

export interface IPillBar {
  label: string;
  value: number;
  /** Ещё не наступило — штриховка вместо заливки (как будущие дни в референсе). */
  pending?: boolean;
  /** Выделенный столбик (сегодня) — с подписью значения. */
  highlight?: boolean;
}

interface IPillBarChartProps {
  bars: IPillBar[];
  height?: number;
  /** Подпись значения над столбиком: «74%», «5». */
  formatValue?: (value: number) => string;
}

/** Самый короткий столбик всё равно виден — пустой день не выглядит «нет данных». */
const MIN_FILL = 0.12;

/** Тон заливки по силе дня: тёмный — максимум, светлый — мало. */
const toneOf = (ratio: number): string => {
  if (ratio > 0.75) return 'bg-brand-900';
  if (ratio > 0.45) return 'bg-brand-700';
  if (ratio > 0.2) return 'bg-brand-500';
  return 'bg-brand-300';
};

/**
 * Столбики-капсулы, как «Project Analytics» в референсе: высота по значению,
 * будущее — штриховкой, сегодняшний — с подписью.
 */
export const PillBarChart = ({ bars, height = 168, formatValue = String }: IPillBarChartProps) => {
  const max = Math.max(1, ...bars.map((bar) => bar.value));

  return (
    <div className="flex items-end justify-between gap-2.5" style={{ height: height + 28 }}>
      {bars.map((bar, index) => {
        const ratio = bar.value / max;
        const fill = bar.pending ? 0.78 : Math.max(MIN_FILL, ratio);
        return (
          <div key={`${bar.label}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="relative flex w-full max-w-[60px] flex-1 items-end">
              {bar.highlight && !bar.pending && (
                <span className="absolute left-1/2 z-10 -translate-x-1/2 rounded-md border border-brand-200 bg-white px-1.5 py-0.5 text-[10.5px] font-bold text-brand-900 shadow-card tabular"
                  style={{ bottom: `calc(${fill * 100}% + 6px)` }}
                >
                  {formatValue(bar.value)}
                </span>
              )}
              <div
                className={cn(
                  'w-full rounded-full transition-[height] duration-500',
                  bar.pending ? 'bg-hatched' : toneOf(ratio),
                )}
                style={{ height: `${fill * 100}%` }}
                title={bar.pending ? bar.label : `${bar.label}: ${formatValue(bar.value)}`}
              />
            </div>
            <span className={cn('text-[13px] font-semibold', bar.highlight ? 'text-ink' : 'text-ink-faint')}>{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
};
