import type { OverviewDay } from '@/api/models';
import type { IPillBar } from '@/components/charts/PillBarChart';
import { addDaysIso, isoDateToLocal } from '@/lib/dates';

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Понедельник недели даты. */
export const mondayOf = (isoDate: string): string => {
  const weekday = isoDateToLocal(isoDate).getDay();
  return addDaysIso(isoDate, weekday === 0 ? -6 : 1 - weekday);
};

/**
 * Столбики текущей недели: закрытые задачи по дням (сутки в UTC, как вся
 * статистика), будущие дни — штриховкой, сегодня — с подписью.
 */
export const weekBars = (days: OverviewDay[], today: string): IPillBar[] => {
  const completed = new Map(days.map((day) => [day.date, day.completed]));
  const monday = mondayOf(today);
  return WEEKDAY_LABELS.map((label, index) => {
    const date = addDaysIso(monday, index);
    return {
      label,
      value: completed.get(date) ?? 0,
      pending: date > today,
      highlight: date === today,
    };
  });
};
