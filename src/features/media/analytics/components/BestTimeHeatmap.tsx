import { useMemo, useState } from 'react';

import type { BestTimeCell } from '@/api/models';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { cn } from '@/lib/utils';
import { formatCompact, formatPercent } from '../../lib/format';

type TMeasure = 'views' | 'er';

/** Недели — с понедельника; в данных 0 — воскресенье (как getUTCDay). */
const WEEKDAYS: Array<{ index: number; label: string }> = [
  { index: 1, label: 'Пн' },
  { index: 2, label: 'Вт' },
  { index: 3, label: 'Ср' },
  { index: 4, label: 'Чт' },
  { index: 5, label: 'Пт' },
  { index: 6, label: 'Сб' },
  { index: 0, label: 'Вс' },
];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** Тон ячейки по доле от лучшей. */
const toneOf = (ratio: number): string => {
  if (ratio > 0.8) return 'bg-brand-900';
  if (ratio > 0.6) return 'bg-brand-700';
  if (ratio > 0.4) return 'bg-brand-500';
  if (ratio > 0.2) return 'bg-brand-300';
  return 'bg-brand-100';
};

/**
 * Когда посты набирают больше: день недели × час выхода (в поясе человека).
 * Пустая клетка — в это время не публиковали, а не «плохо».
 */
export const BestTimeHeatmap = ({ cells }: { cells: BestTimeCell[] }) => {
  const [measure, setMeasure] = useState<TMeasure>('views');
  const byKey = useMemo(() => new Map(cells.map((cell) => [`${cell.weekday}|${cell.hour}`, cell])), [cells]);
  const valueOf = (cell: BestTimeCell | undefined): number | null =>
    cell ? (measure === 'views' ? cell.avgViews : cell.avgEngagementRate) : null;
  const max = Math.max(0, ...cells.map((cell) => valueOf(cell) ?? 0));
  const best = cells.reduce<BestTimeCell | null>((top, cell) => ((valueOf(cell) ?? -1) > (valueOf(top ?? undefined) ?? -1) ? cell : top), null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          segments={[{ value: 'views', label: 'Просмотры' }, { value: 'er', label: 'Вовлечённость' }]}
          value={measure}
          onChange={setMeasure}
          size="sm"
        />
        {best && (
          <span className="text-[13px] text-ink-muted">
            Лучше всего — <b className="text-ink">{WEEKDAYS.find((day) => day.index === best.weekday)?.label}, {best.hour}:00</b>
          </span>
        )}
      </div>
      <div className="overflow-x-auto scrollbar-none">
        <div className="grid min-w-[520px] grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-[3px]">
          <span />
          {HOURS.map((hour) => (
            <span key={hour} className="text-center text-[10px] font-semibold text-ink-faint tabular">{hour % 3 === 0 ? hour : ''}</span>
          ))}
          {WEEKDAYS.map((day) => (
            <div key={day.index} className="contents">
              <span className="flex items-center text-[11px] font-bold text-ink-muted">{day.label}</span>
              {HOURS.map((hour) => {
                const cell = byKey.get(`${day.index}|${hour}`);
                const value = valueOf(cell);
                return (
                  <span
                    key={hour}
                    className={cn('aspect-square rounded-[5px]', value === null ? 'bg-secondary' : toneOf(max ? value / max : 0))}
                    title={cell ? `${day.label}, ${hour}:00 — постов: ${cell.posts}, просмотры в среднем: ${formatCompact(cell.avgViews)}, ER: ${formatPercent(cell.avgEngagementRate)}` : `${day.label}, ${hour}:00 — не публиковали`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
