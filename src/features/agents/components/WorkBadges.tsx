import { Bot } from 'lucide-react';

import type { JournalMetric, JournalSession } from '@/api/models';
import { cn } from '@/lib/utils';
import { agentLabel, workPill } from '../lib/journalMeta';

/** Пилюля работы: «Идёт» с пульсом, исход или «Без итога». */
export const WorkPill = ({ session, className }: { session: Pick<JournalSession, 'status' | 'outcome'>; className?: string }) => {
  const pill = workPill(session);
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] font-bold', pill.chip, className)}>
      {session.status === 'active' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      )}
      {pill.label}
    </span>
  );
};

/** Через какого агента шла работа: «Claude Code 2.1». */
export const AgentBadge = ({ session, className }: { session: Pick<JournalSession, 'client' | 'clientLabel'>; className?: string }) => (
  <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 text-[12px] font-semibold text-ink-soft', className)}>
    <Bot className="h-3.5 w-3.5 text-brand-800" /> {agentLabel(session)}
  </span>
);

const formatMetricValue = (value: number): string =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);

/** Цифры результата: «CTR 1,4 %», «Лиды 12». */
export const MetricChips = ({ metrics }: { metrics: JournalMetric[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {metrics.map((metric) => (
      <span key={`${metric.label}-${metric.value}`} className="inline-flex items-baseline gap-1 rounded-xl bg-brand-50 px-2.5 py-1 text-[12.5px]">
        <span className="font-semibold text-brand-900">{metric.label}</span>
        <span className="tabular font-extrabold text-ink">
          {formatMetricValue(metric.value)}
          {metric.unit ? `\u00a0${metric.unit}` : ''}
        </span>
      </span>
    ))}
  </div>
);
