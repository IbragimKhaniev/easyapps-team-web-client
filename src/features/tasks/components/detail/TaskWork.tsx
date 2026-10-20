import { useListJournalSessions } from '@/api/generated/journal/journal';
import { WorkCard } from '@/features/agents/components/WorkCard';

const TASK_WORK_LIMIT = 20;
const TASK_WORK_REFRESH_MS = 15_000;

/** Работы агентов над задачей: кто, чем закончилось, плюсы и минусы — новые сверху. */
export const TaskWork = ({ taskKey }: { taskKey: string }) => {
  const { data, isLoading } = useListJournalSessions({ task: taskKey, limit: TASK_WORK_LIMIT }, { query: { refetchInterval: TASK_WORK_REFRESH_MS } });
  const sessions = data?.data ?? [];

  if (isLoading) return <div className="skeleton h-32 rounded-2xl" />;
  if (!sessions.length) {
    return (
      <p className="rounded-2xl bg-secondary px-4 py-5 text-center text-[13.5px] leading-snug text-ink-muted">
        Через агентов над задачей ещё не работали. Агент откроет работу здесь сам: start_work с ключом {taskKey}.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => <WorkCard key={session.id} session={session} hideTask />)}
    </div>
  );
};
