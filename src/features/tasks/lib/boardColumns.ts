import type { Task, TaskStatus } from '@/api/models';
import { BOARD_STATUSES } from '@/lib/tracker';
import { rankBetween } from '@/lib/rank';

export type TBoardColumns = Record<TaskStatus, Task[]>;

const byRank = (a: Task, b: Task): number => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0);

/** Задачи → колонки доски (отменённые на доске не показываем). */
export const toColumns = (tasks: Task[]): TBoardColumns => {
  const columns = Object.fromEntries(BOARD_STATUSES.map((status) => [status, [] as Task[]])) as unknown as TBoardColumns;
  for (const task of tasks) {
    if (columns[task.status]) columns[task.status].push(task);
  }
  for (const status of BOARD_STATUSES) columns[status].sort(byRank);
  return columns;
};

/** В какой колонке задача (или сама колонка, если id — статус). */
export const columnOf = (columns: TBoardColumns, id: string): TaskStatus | undefined => {
  if (id in columns) return id as TaskStatus;
  return BOARD_STATUSES.find((status) => columns[status].some((task) => task.key === id));
};

export interface IDropPlacement {
  status: TaskStatus;
  prevKey: string | null;
  nextKey: string | null;
  /** Ключ порядка, чтобы карточка встала на место сразу, до ответа сервера. */
  rank: string;
}

/** Соседи задачи в колонке после переноса и её новый ключ порядка. */
export const placementOf = (column: Task[], status: TaskStatus, key: string): IDropPlacement => {
  const index = column.findIndex((task) => task.key === key);
  const prev = index > 0 ? column[index - 1] : null;
  const next = index >= 0 && index < column.length - 1 ? column[index + 1] : null;
  let rank: string;
  try {
    rank = rankBetween(prev?.rank ?? null, next && (!prev || prev.rank < next.rank) ? next.rank : null);
  } catch {
    rank = column[index]?.rank ?? 'a0';
  }
  return { status, prevKey: prev?.key ?? null, nextKey: next?.key ?? null, rank };
};
