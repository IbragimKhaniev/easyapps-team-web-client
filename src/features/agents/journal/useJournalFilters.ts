import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Исход в фильтре ленты: «без итога» — закрытые без finish_work. */
export type TOutcomeFilter = 'all' | 'done' | 'progress' | 'blocked' | 'failed' | 'abandoned';

export const OUTCOME_FILTERS: Array<{ value: TOutcomeFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'done', label: 'Сделано' },
  { value: 'progress', label: 'Продвинулись' },
  { value: 'blocked', label: 'Упёрлись' },
  { value: 'failed', label: 'Не получилось' },
  { value: 'abandoned', label: 'Без итога' },
];

export const PERIOD_FILTERS = [
  { value: '7', label: '7 дней' },
  { value: '30', label: '30 дней' },
  { value: '90', label: '90 дней' },
] as const;
export type TPeriodFilter = typeof PERIOD_FILTERS[number]['value'];

const isOutcome = (value: string | null): value is TOutcomeFilter => OUTCOME_FILTERS.some((item) => item.value === value);
const isPeriod = (value: string | null): value is TPeriodFilter => PERIOD_FILTERS.some((item) => item.value === value);

/** Фильтры ленты журнала — в адресе: ссылку с фильтром можно переслать. */
export const useJournalFilters = () => {
  const [params, setParams] = useSearchParams();
  const userId = params.get('person');
  const outcomeParam = params.get('outcome');
  const periodParam = params.get('days');
  const outcome: TOutcomeFilter = isOutcome(outcomeParam) ? outcomeParam : 'all';
  const period: TPeriodFilter = isPeriod(periodParam) ? periodParam : '30';
  const q = params.get('q') ?? '';

  const update = useCallback((patch: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next;
  }, { replace: true }), [setParams]);

  return { userId, outcome, period, q, update };
};
