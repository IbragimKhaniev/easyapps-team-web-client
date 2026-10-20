import { useListJournalSessions } from '@/api/generated/journal/journal';

const TASK_WORK_COUNT_STALE_MS = 15_000;

/** Сколько работ агентов по задаче — для подписи вкладки «Агенты». */
export const useTaskWorkCount = (taskKey: string): number => {
  const { data } = useListJournalSessions({ task: taskKey, limit: 1 }, { query: { staleTime: TASK_WORK_COUNT_STALE_MS } });
  return data?.pagination.totalItems ?? 0;
};
