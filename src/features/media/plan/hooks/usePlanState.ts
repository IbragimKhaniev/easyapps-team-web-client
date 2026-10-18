import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { SocialPlatform } from '@/api/models';
import { todayIso } from '@/lib/dates';
import { monthKeyOf, shiftMonth, type TMonthKey } from '../../lib/calendar';
import { isPlatform } from '../../lib/platforms';

const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Месяц, выбранный день и площадка плана — в адресе (`?month=2026-10&day=2026-10-20&platform=vk`):
 * ссылка ведёт ровно туда, «назад» возвращает прошлый месяц.
 */
export const usePlanState = () => {
  const [params, setParams] = useSearchParams();
  const today = todayIso();
  const rawDay = params.get('day');
  const day = rawDay && DAY_PATTERN.test(rawDay) ? rawDay : today;
  const rawMonth = params.get('month');
  const month: TMonthKey = rawMonth && MONTH_PATTERN.test(rawMonth) ? rawMonth : monthKeyOf(day);
  const rawPlatform = params.get('platform');
  const platform: SocialPlatform | null = isPlatform(rawPlatform) ? rawPlatform : null;

  const update = useCallback((patch: Record<string, string | null>) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true }), [setParams]);

  return {
    today,
    day,
    month,
    platform,
    selectDay: (iso: string) => update({ day: iso, month: monthKeyOf(iso) }),
    shift: (delta: number) => update({ month: shiftMonth(month, delta) }),
    goToday: () => update({ day: today, month: monthKeyOf(today) }),
    setPlatform: (value: SocialPlatform | null) => update({ platform: value }),
  };
};
