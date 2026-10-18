import { useSearchParams } from 'react-router-dom';

import type { SocialPlatform } from '@/api/models';
import { addDaysIso, todayIso } from '@/lib/dates';
import { isPlatform } from '../../lib/platforms';

export type TPeriod = '7' | '30' | '90' | '365';

export const PERIODS: Array<{ value: TPeriod; label: string }> = [
  { value: '7', label: '7 дней' },
  { value: '30', label: '30 дней' },
  { value: '90', label: '3 месяца' },
  { value: '365', label: 'Год' },
];

/** Смещение пояса человека для тепловой карты: «+03:00». */
const timezoneOffset = (): string => {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const absolute = Math.abs(minutes);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
};

/** Площадка и период аналитики — в адресе (`?platform=vk&period=90`). */
export const useAnalyticsState = () => {
  const [params, setParams] = useSearchParams();
  const rawPlatform = params.get('platform');
  const platform: SocialPlatform | null = isPlatform(rawPlatform) ? rawPlatform : null;
  const period = (PERIODS.find((item) => item.value === params.get('period'))?.value ?? '30') as TPeriod;
  const to = todayIso();
  const from = addDaysIso(to, -(Number(period) - 1));

  const update = (key: string, value: string | null) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  }, { replace: true });

  return {
    platform,
    period,
    from,
    to,
    tz: timezoneOffset(),
    setPlatform: (value: SocialPlatform | null) => update('platform', value),
    setPeriod: (value: TPeriod) => update('period', value === '30' ? null : value),
  };
};
