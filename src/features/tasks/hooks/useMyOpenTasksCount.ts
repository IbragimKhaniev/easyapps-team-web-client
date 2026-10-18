import { useListTasks } from '@/api/generated/tasks/tasks';
import { OPEN_STATUSES } from '@/lib/tracker';

/** Сколько у меня незакрытых задач — для счётчика в меню. */
export const useMyOpenTasksCount = (): number | undefined => {
  const { data } = useListTasks(
    { assignee: 'me', status: OPEN_STATUSES.join(','), limit: 1 },
    { query: { staleTime: 30_000 } },
  );
  return data?.data.total;
};
