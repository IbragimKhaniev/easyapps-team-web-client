import type { Task } from '@/api/models';
import { addDaysIso } from '@/lib/dates';

export interface IDueBucket {
  id: 'overdue' | 'today' | 'tomorrow' | 'week' | 'later' | 'none';
  title: string;
  tasks: Task[];
}

const WEEK_DAYS = 7;

/** «Мой день» как в Things: просрочено, сегодня, завтра, на неделе, позже, без срока. */
export const groupByDue = (tasks: Task[], today: string): IDueBucket[] => {
  const tomorrow = addDaysIso(today, 1);
  const weekEnd = addDaysIso(today, WEEK_DAYS);
  const buckets: IDueBucket[] = [
    { id: 'overdue', title: 'Просрочено', tasks: [] },
    { id: 'today', title: 'Сегодня', tasks: [] },
    { id: 'tomorrow', title: 'Завтра', tasks: [] },
    { id: 'week', title: 'На неделе', tasks: [] },
    { id: 'later', title: 'Позже', tasks: [] },
    { id: 'none', title: 'Без срока', tasks: [] },
  ];
  const byId = Object.fromEntries(buckets.map((bucket) => [bucket.id, bucket])) as Record<IDueBucket['id'], IDueBucket>;

  for (const task of tasks) {
    const due = task.dueDate;
    if (!due) byId.none.tasks.push(task);
    else if (due < today) byId.overdue.tasks.push(task);
    else if (due === today) byId.today.tasks.push(task);
    else if (due === tomorrow) byId.tomorrow.tasks.push(task);
    else if (due <= weekEnd) byId.week.tasks.push(task);
    else byId.later.tasks.push(task);
  }
  return buckets.filter((bucket) => bucket.tasks.length > 0);
};
