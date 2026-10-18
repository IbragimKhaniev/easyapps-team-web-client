import { ChevronDown, LayoutGrid, List, Search, X } from 'lucide-react';
import { forwardRef, useMemo } from 'react';

import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { useMembers, useProjects } from '@/hooks/useDirectory';
import { cn } from '@/lib/utils';
import { ProjectBadge } from './ProjectBadge';

export type TTasksView = 'list' | 'board';

export interface ITaskFiltersValue {
  view: TTasksView;
  project?: string;
  assignee?: string;
  q: string;
}

const ALL = 'all';

/** Капсула фильтра. forwardRef: её оборачивает триггер выбора (Radix передаёт ref). */
const FilterPill = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }>(
  ({ active, children, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[14px] font-semibold transition-colors',
        active ? 'border-brand-300 bg-brand-50 text-brand-900' : 'border-black/[0.07] bg-white text-ink hover:bg-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
FilterPill.displayName = 'FilterPill';

interface ITaskFiltersProps {
  value: ITaskFiltersValue;
  onChange: (patch: Partial<ITaskFiltersValue>) => void;
}

/** Фильтры задач: вид, проект, исполнитель, поиск. Всё хранится в адресе — ссылкой можно поделиться. */
export const TaskFilters = ({ value, onChange }: ITaskFiltersProps) => {
  const { list: projects, map: projectMap } = useProjects();
  const { list: members, map: memberMap } = useMembers();

  const projectOptions = useMemo(
    () => [
      { value: ALL, label: 'Все проекты' },
      ...projects.map((project) => ({ value: project.id, label: project.name, hint: project.key, icon: <ProjectBadge project={project} /> })),
    ],
    [projects],
  );
  const assigneeOptions = useMemo(
    () => [
      { value: ALL, label: 'Все' },
      { value: 'me', label: 'Мои' },
      { value: 'none', label: 'Без исполнителя' },
      ...members.map((member) => ({ value: member.id, label: member.name, icon: <MemberAvatar member={member} size="xs" /> })),
    ],
    [members],
  );

  const project = value.project ? projectMap.get(value.project) : undefined;
  const assigneeLabel =
    value.assignee === 'me' ? 'Мои' : value.assignee === 'none' ? 'Без исполнителя' : value.assignee ? memberMap.get(value.assignee)?.name ?? 'Исполнитель' : 'Все';

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SegmentedControl
        value={value.view}
        onChange={(view) => onChange({ view })}
        segments={[
          { value: 'list', label: <><List /> Список</> },
          { value: 'board', label: <><LayoutGrid /> Доска</> },
        ]}
        className="self-start"
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:px-0">
        <AdaptivePicker
          title="Проект"
          options={projectOptions}
          selected={value.project ?? ALL}
          onSelect={(selected) => onChange({ project: selected === ALL ? undefined : selected })}
          trigger={
            <FilterPill active={Boolean(project)}>
              {project ? <ProjectBadge project={project} className="h-5 w-5 text-[11px]" /> : null}
              {project?.name ?? 'Все проекты'}
              <ChevronDown className="h-4 w-4 text-ink-faint" />
            </FilterPill>
          }
        />
        <AdaptivePicker
          title="Исполнитель"
          options={assigneeOptions}
          selected={value.assignee ?? ALL}
          searchable
          onSelect={(selected) => onChange({ assignee: selected === ALL ? undefined : selected })}
          trigger={
            <FilterPill active={Boolean(value.assignee)}>
              {assigneeLabel}
              <ChevronDown className="h-4 w-4 text-ink-faint" />
            </FilterPill>
          }
        />
      </div>

      <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3.5 focus-within:border-brand/40 lg:max-w-xs">
        <Search className="h-4 w-4 shrink-0 text-ink-faint" />
        <input
          value={value.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder="Поиск по названию или EA-42"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
        />
        {value.q && (
          <button type="button" onClick={() => onChange({ q: '' })} aria-label="Очистить поиск">
            <X className="h-4 w-4 text-ink-faint" />
          </button>
        )}
      </label>
    </div>
  );
};
