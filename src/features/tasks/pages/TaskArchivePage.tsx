import { Archive, ChevronDown, Search, ShieldAlert, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useListArchivedTasks } from '@/api/generated/tasks/tasks';
import { PATHS } from '@/app/paths';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';
import { useMembers, useProjects } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { pluralize, TASK_FORMS } from '@/lib/plural';
import { ArchivedTaskCard } from '../components/ArchivedTaskCard';
import { ProjectBadge } from '../components/ProjectBadge';
import { FilterPill } from '../components/TaskFilters';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskParam } from '../hooks/useTaskParam';

const ALL = 'all';
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Архив задач — администратору: что убрали в архив, кто и когда, что уйдёт
 * вместе с задачей. Вернуть или удалить насовсем; проект и поиск — в адресе.
 */
export const TaskArchivePage = () => {
  const { isAdmin, isLoading: sessionLoading } = useSession();
  const [params, setParams] = useSearchParams();
  const project = params.get('project') ?? undefined;
  const [query, setQuery] = useState(params.get('q') ?? '');
  const q = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const { list: projects, map: projectMap } = useProjects(true);
  const { map: members } = useMembers();
  const { openTask } = useTaskParam();
  const { restoreTask } = useTaskActions();

  useEffect(() => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (q) next.set('q', q);
      else next.delete('q');
      return next;
    }, { replace: true });
  }, [q, setParams]);

  const setProject = (value: string) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (value === ALL) next.delete('project');
    else next.set('project', value);
    return next;
  }, { replace: true });

  const { data, isLoading } = useListArchivedTasks(
    { project, q: q || undefined },
    { query: { enabled: isAdmin, placeholderData: (previous) => previous } },
  );
  const tasks = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const selectedProject = project ? projectMap.get(project) : undefined;

  const restore = async (key: string) => {
    if (await restoreTask(key)) toast.success(`${key} вернулась из архива`);
  };

  const projectOptions = useMemo(
    () => [
      { value: ALL, label: 'Все проекты' },
      ...projects.map((item) => ({ value: item.id, label: item.name, hint: item.key, icon: <ProjectBadge project={item} /> })),
    ],
    [projects],
  );

  if (sessionLoading) return <div className="skeleton m-4 h-48 rounded-card lg:m-0" />;

  if (!isAdmin) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Архив задач" backTo={PATHS.tasks} />
        <div className="card-surface mx-4 lg:mx-0">
          <EmptyState
            icon={ShieldAlert}
            title="Архив видит администратор"
            description="Свою задачу из архива можно вернуть по ссылке на неё — в меню карточки «Вернуть из архива»."
            action={<Button asChild><Link to={PATHS.tasks}>К задачам</Link></Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Архив задач"
        subtitle={data ? `${pluralize(total, TASK_FORMS)} в архиве · удалить насовсем может только администратор` : undefined}
        backTo={PATHS.tasks}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <AdaptivePicker
            title="Проект"
            options={projectOptions}
            selected={project ?? ALL}
            onSelect={setProject}
            trigger={
              <FilterPill active={Boolean(selectedProject)} className="self-start">
                {selectedProject ? <ProjectBadge project={selectedProject} className="h-5 w-5 text-[11px]" /> : null}
                {selectedProject?.name ?? 'Все проекты'}
                <ChevronDown className="h-4 w-4 text-ink-faint" />
              </FilterPill>
            }
          />
          <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 focus-within:border-brand/40 lg:max-w-xs">
            <Search className="h-4 w-4 shrink-0 text-ink-faint" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию или EA-42"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Очистить поиск">
                <X className="h-4 w-4 text-ink-faint" />
              </button>
            )}
          </label>
        </div>
      </PageHeader>

      {/* На телефоне шапка без нижнего отступа — список отодвигаем от поиска сами. */}
      <div className="mt-4 lg:mt-0">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 px-4 lg:px-0 xl:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton h-44 rounded-card" />)}
          </div>
        ) : !tasks.length ? (
          <div className="card-surface mx-4 lg:mx-0">
            <EmptyState
              icon={Archive}
              title={q || project ? 'Ничего не нашлось' : 'Архив пуст'}
              description={q || project ? 'Попробуйте другой запрос или проект.' : 'Задачи попадают сюда из меню карточки «В архив» или свайпом влево на телефоне.'}
            />
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3 px-4 lg:px-0 xl:grid-cols-2">
              {tasks.map((task) => (
                <ArchivedTaskCard
                  key={task.id}
                  task={task}
                  project={projectMap.get(task.projectId)}
                  members={members}
                  onOpen={openTask}
                  onRestore={(key) => void restore(key)}
                />
              ))}
            </ul>
            {data?.data.truncated && (
              <p className="py-4 text-center text-[13px] text-ink-muted">Показаны последние {tasks.length} — уточните поиск или проект.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
