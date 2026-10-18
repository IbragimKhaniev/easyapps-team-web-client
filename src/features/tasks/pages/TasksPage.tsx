import { ListTodo, Plus } from 'lucide-react';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useListTasks } from '@/api/generated/tasks/tasks';
import { uiActions } from '@/app/uiStore';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useProjects } from '@/hooks/useDirectory';
import { todayIso } from '@/lib/dates';
import { pluralize, TASK_FORMS } from '@/lib/plural';
import { BOARD_STATUSES } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { TaskBoard } from '../components/TaskBoard';
import { TaskFilters, type ITaskFiltersValue, type TTasksView } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import { useTaskRowContext } from '../hooks/useTaskRowContext';

/** Доска живая: пока она открыта, раз в 20 с подтягиваем изменения коллег. */
const LIVE_REFRESH_MS = 20_000;
const LIST_LIMIT = 2000;

/** Все задачи команды: список по статусам или доска, фильтры в адресе. */
export const TasksPage = () => {
  const [params, setParams] = useSearchParams();
  const context = useTaskRowContext();
  const { map: projects } = useProjects();

  const filters: ITaskFiltersValue = {
    view: (params.get('view') as TTasksView) === 'board' ? 'board' : 'list',
    project: params.get('project') ?? undefined,
    assignee: params.get('assignee') ?? undefined,
    q: params.get('q') ?? '',
  };
  const q = useDebounce(filters.q.trim(), 250);

  const changeFilters = useCallback(
    (patch: Partial<ITaskFiltersValue>) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(patch)) {
          if (value === undefined || value === '' || (key === 'view' && value === 'list')) next.delete(key);
          else next.set(key, String(value));
        }
        return next;
      }, { replace: true }),
    [setParams],
  );

  const { data, isLoading } = useListTasks(
    {
      project: filters.project,
      assignee: filters.assignee,
      q: q || undefined,
      status: filters.view === 'board' ? BOARD_STATUSES.join(',') : undefined,
      today: todayIso(),
      limit: LIST_LIMIT,
    },
    { query: { refetchInterval: LIVE_REFRESH_MS } },
  );
  const tasks = data?.data.items ?? [];
  const project = filters.project ? projects.get(filters.project) : undefined;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={project ? project.name : 'Задачи'}
        subtitle={data ? `${pluralize(data.data.total, TASK_FORMS)}${project ? ` · ${project.key}` : ''}` : undefined}
        actions={
          <Button
            size={context.isDesktop ? 'lg' : 'icon'}
            onClick={() => uiActions.openQuickAdd({ projectId: filters.project })}
            aria-label="Новая задача"
          >
            <Plus />
            {context.isDesktop && 'Новая задача'}
          </Button>
        }
      >
        <TaskFilters value={filters} onChange={changeFilters} />
      </PageHeader>

      {isLoading ? (
        <div className={cn('skeleton h-64 rounded-card', !context.isDesktop && 'mx-4')} />
      ) : !tasks.length ? (
        <div className={cn('card-surface', !context.isDesktop && 'mx-4')}>
          <EmptyState
            icon={ListTodo}
            title={q ? 'Ничего не нашлось' : 'Задач пока нет'}
            description={q ? 'Попробуйте другой запрос или ключ задачи.' : 'Заведите первую — это займёт пару секунд.'}
            action={!q && <Button onClick={() => uiActions.openQuickAdd({ projectId: filters.project })}><Plus /> Новая задача</Button>}
          />
        </div>
      ) : filters.view === 'board' ? (
        <TaskBoard tasks={tasks} context={context} projectId={filters.project} />
      ) : (
        <div className={cn(!context.isDesktop && 'px-4')}>
          <TaskList tasks={tasks} context={context} showProject={!filters.project} projectId={filters.project} />
        </div>
      )}
    </div>
  );
};
