import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface IKpiCardProps {
  label: string;
  value: ReactNode;
  /** Подпись под числом: «+5 к прошлой неделе». */
  hint?: ReactNode;
  /** Изменение к прошлому периоду: знак задаёт стрелку. */
  delta?: number;
  /** Залитая «главная» плитка — одна на ряд. */
  highlighted?: boolean;
  to?: string;
  className?: string;
  /** Плотный ряд (5 плиток и длинные числа «21,6 тыс.») — цифра помельче. */
  compact?: boolean;
}

/**
 * Плитка с крупной цифрой: подпись, стрелка-переход в круге, число и
 * изменение к прошлому периоду — ровно как ряд KPI в референсе.
 */
export const KpiCard = ({ label, value, hint, delta, highlighted = false, to, className, compact = false }: IKpiCardProps) => {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('text-[15px] font-semibold', highlighted ? 'text-white' : 'text-ink')}>{label}</span>
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:rotate-45',
            highlighted ? 'bg-white text-brand-800' : 'border border-ink/70 text-ink',
          )}
        >
          <ArrowUpRight className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div
        className={cn(
          'tabular mt-4 whitespace-nowrap',
          compact ? 'text-[2.375rem] font-bold leading-none tracking-[-0.035em]' : 'text-kpi',
          highlighted ? 'text-white' : 'text-ink',
        )}
      >
        {value}
      </div>
      {(hint || delta !== undefined) && (
        <div className={cn('mt-3 flex items-center gap-2 text-xs font-medium', highlighted ? 'text-white/85' : 'text-brand-800')}>
          {delta !== undefined && delta !== 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-bold',
                highlighted ? 'border-white/50 text-white' : 'border-brand-300 text-brand-800',
              )}
            >
              {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(delta)}
            </span>
          )}
          {hint && <span className={cn(!highlighted && 'text-ink-muted')}>{hint}</span>}
        </div>
      )}
    </>
  );

  const classes = cn(
    'group flex min-h-[172px] flex-col rounded-card p-5 transition-shadow',
    highlighted ? 'tile-brand shadow-lift' : 'card-surface hover:shadow-float',
    className,
  );

  return to ? <Link to={to} className={classes}>{body}</Link> : <div className={classes}>{body}</div>;
};
