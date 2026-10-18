import { differenceInCalendarDays, format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Даты на клиенте.
 *
 * Сроки задач — календарные даты `YYYY-MM-DD` без часового пояса. «Сегодня»
 * для них — дата человека (его часы), её же шлём серверу в `today`, чтобы
 * «просрочено» совпадало с тем, что он видит. День из строки собираем через
 * `Date.UTC`, а показываем UTC-методами — иначе пояс сдвигал бы дату.
 */

const pad = (value: number): string => String(value).padStart(2, '0');

/** Сегодняшняя дата человека: `2026-10-18`. */
export const todayIso = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

/** `YYYY-MM-DD` → Date на полночь UTC (только для показа и арифметики дат). */
export const isoDateToUtc = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/** Date (выбор в календаре — локальная полночь) → `YYYY-MM-DD`. */
export const localDateToIso = (date: Date): string => todayIso(date);

/** `YYYY-MM-DD` → локальная полночь (для react-day-picker). */
export const isoDateToLocal = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDaysIso = (isoDate: string, days: number): string => {
  const date = isoDateToUtc(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

/** Сколько дней от сегодня до даты: 0 — сегодня, -1 — вчера. */
export const daysFromToday = (isoDate: string, today: string = todayIso()): number =>
  differenceInCalendarDays(isoDateToLocal(isoDate), isoDateToLocal(today));

export type TDueTone = 'overdue' | 'today' | 'soon' | 'later';

export interface IDueLabel {
  text: string;
  tone: TDueTone;
}

/** Подпись срока: «Сегодня», «Завтра», «Вчера», «пт», «24 окт», «3 дн. назад». */
export const dueLabel = (isoDate: string, today: string = todayIso()): IDueLabel => {
  const diff = daysFromToday(isoDate, today);
  const date = isoDateToLocal(isoDate);
  if (diff === 0) return { text: 'Сегодня', tone: 'today' };
  if (diff === 1) return { text: 'Завтра', tone: 'soon' };
  if (diff === -1) return { text: 'Вчера', tone: 'overdue' };
  if (diff < 0) return { text: format(date, 'd MMM', { locale: ru }), tone: 'overdue' };
  if (diff < 7) {
    const weekday = format(date, 'EEEEEE', { locale: ru });
    return { text: weekday.charAt(0).toUpperCase() + weekday.slice(1), tone: 'soon' };
  }
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return { text: format(date, sameYear ? 'd MMM' : 'd MMM yyyy', { locale: ru }), tone: 'later' };
};

/** «18 октября» / «18 октября 2025». */
export const formatLongDate = (isoDate: string): string => {
  const date = isoDateToLocal(isoDate);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return format(date, sameYear ? 'd MMMM' : 'd MMMM yyyy', { locale: ru });
};

/** Момент (ISO date-time) → «5 мин назад». */
export const timeAgo = (isoDateTime: string): string => {
  const date = parseISO(isoDateTime);
  if (!isValid(date)) return '';
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 45) return 'только что';
  return `${formatDistanceToNowStrict(date, { locale: ru })} назад`;
};

/** Момент → «18 окт, 14:05». */
export const formatDateTime = (isoDateTime: string): string =>
  format(parseISO(isoDateTime), 'd MMM, HH:mm', { locale: ru });

/** Момент → «14:05». */
export const formatTime = (isoDateTime: string): string => format(parseISO(isoDateTime), 'HH:mm');

/** «Доброе утро» / «Добрый день» / «Добрый вечер» / «Доброй ночи». */
export const greeting = (now: Date = new Date()): string => {
  const hour = now.getHours();
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
};
