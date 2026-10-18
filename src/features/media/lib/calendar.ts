import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { addDaysIso, isoDateToLocal, isoDateToUtc, todayIso } from '@/lib/dates';

/**
 * Сетка месяца для контент-плана: недели с понедельника, дни соседних
 * месяцев по краям. Все даты — `YYYY-MM-DD` (день плана, как его видит
 * команда), арифметика — через UTC, чтобы пояс не сдвигал дни.
 */

export interface ICalendarDay {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

/** `2026-10` — ключ месяца. */
export type TMonthKey = string;

export const monthKeyOf = (isoDate: string): TMonthKey => isoDate.slice(0, 7);

export const firstDayOfMonth = (month: TMonthKey): string => `${month}-01`;

export const lastDayOfMonth = (month: TMonthKey): string => {
  const [year, monthIndex] = month.split('-').map(Number);
  const last = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  return `${month}-${String(last).padStart(2, '0')}`;
};

export const shiftMonth = (month: TMonthKey, delta: number): TMonthKey => {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

/** Понедельник недели даты. */
const startOfWeek = (isoDate: string): string => {
  const weekday = isoDateToUtc(isoDate).getUTCDay();
  return addDaysIso(isoDate, weekday === 0 ? -6 : 1 - weekday);
};

/** Недели месяца — 5 или 6 рядов по 7 дней. */
export const monthWeeks = (month: TMonthKey, today: string = todayIso()): ICalendarDay[][] => {
  const first = firstDayOfMonth(month);
  const last = lastDayOfMonth(month);
  const weeks: ICalendarDay[][] = [];
  for (let cursor = startOfWeek(first); cursor <= last; ) {
    const week: ICalendarDay[] = [];
    for (let index = 0; index < 7; index += 1) {
      const weekday = isoDateToUtc(cursor).getUTCDay();
      week.push({
        iso: cursor,
        day: isoDateToUtc(cursor).getUTCDate(),
        inMonth: monthKeyOf(cursor) === month,
        isToday: cursor === today,
        isWeekend: weekday === 0 || weekday === 6,
      });
      cursor = addDaysIso(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
};

/** Дни недели даты — полоска на телефоне. */
export const weekOf = (isoDate: string, today: string = todayIso()): ICalendarDay[] => {
  const start = startOfWeek(isoDate);
  return Array.from({ length: 7 }, (_, index) => {
    const iso = addDaysIso(start, index);
    const weekday = isoDateToUtc(iso).getUTCDay();
    return { iso, day: isoDateToUtc(iso).getUTCDate(), inMonth: true, isToday: iso === today, isWeekend: weekday === 0 || weekday === 6 };
  });
};

export const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** «Октябрь 2026». */
export const monthTitle = (month: TMonthKey): string => {
  const title = format(isoDateToLocal(firstDayOfMonth(month)), 'LLLL yyyy', { locale: ru });
  return title.charAt(0).toUpperCase() + title.slice(1);
};

/** «Вторник, 20 октября». */
export const dayTitle = (isoDate: string): string => {
  const title = format(isoDateToLocal(isoDate), 'EEEE, d MMMM', { locale: ru });
  return title.charAt(0).toUpperCase() + title.slice(1);
};

/** Время публикации в поясе человека: «10:00». */
export const localTimeOf = (isoDateTime: string): string => format(new Date(isoDateTime), 'HH:mm');

/** День плана + время человека → момент публикации (ISO). */
export const publishMomentOf = (isoDate: string, time: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
};

/** Ближайшее «круглое» время для нового поста: через час, по получасам. */
export const suggestedTime = (now: Date = new Date()): string => {
  const next = new Date(now.getTime() + 60 * 60 * 1000);
  const minutes = next.getMinutes() < 30 ? '00' : '30';
  return `${String(next.getHours()).padStart(2, '0')}:${minutes}`;
};
