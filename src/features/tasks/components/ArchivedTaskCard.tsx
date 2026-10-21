import { Archive, Bot, History, MessageCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { ArchivedTask, Project, TeamMember } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { formatDateTime, timeAgo } from '@/lib/dates';
import { STATUS_META } from '@/lib/tracker';
import { PriorityIcon } from './PriorityIcon';
import { ProjectBadge } from './ProjectBadge';
import { StatusIcon } from './StatusIcon';
import { TaskPurgeDialog } from './TaskPurgeDialog';

interface IArchivedTaskCardProps {
  task: ArchivedTask;
  project?: Project;
  members: Map<string, TeamMember>;
  onOpen: (key: string) => void;
  onRestore: (key: string) => void;
}

const Counter = ({ icon: Icon, value, title }: { icon: typeof Bot; value: number; title: string }) => (
  <span className={value ? 'inline-flex items-center gap-1 text-ink-muted' : 'inline-flex items-center gap-1 text-ink-faint'} title={title}>
    <Icon className="h-3.5 w-3.5" /> {value}
  </span>
);

/**
 * Задача в архиве: что это была за задача, чья, кто и когда убрал и что уйдёт
 * вместе с ней — комментарии, работы агентов, история. Вернуть или удалить
 * насовсем — здесь же.
 */
export const ArchivedTaskCard = ({ task, project, members, onOpen, onRestore }: IArchivedTaskCardProps) => {
  const [purging, setPurging] = useState(false);
  const author = members.get(task.createdById);
  const archivedBy = task.archivedById ? members.get(task.archivedById) : undefined;
  const assignee = task.assigneeId ? members.get(task.assigneeId) : undefined;

  return (
    <li className="card-surface flex flex-col gap-3 p-4 lg:p-5">
      <div className="flex items-start gap-3">
        {project ? <ProjectBadge project={project} className="mt-0.5" /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-muted">
            <span className="whitespace-nowrap font-mono font-semibold">{task.key}</span>
            <span className="inline-flex items-center gap-1">
              <StatusIcon status={task.status} className="h-3.5 w-3.5" /> {STATUS_META[task.status].label}
            </span>
            {task.priority !== 'none' && <PriorityIcon priority={task.priority} />}
          </div>
          <button
            type="button"
            onClick={() => onOpen(task.key)}
            className="mt-1 text-left text-[15.5px] font-bold leading-snug text-ink hover:underline"
          >
            {task.title}
          </button>
          {task.descriptionPreview && <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink-muted">{task.descriptionPreview}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5" title={task.archivedAt ? formatDateTime(task.archivedAt) : undefined}>
          <Archive className="h-3.5 w-3.5" />
          в архиве {task.archivedAt ? timeAgo(task.archivedAt) : ''}{archivedBy ? ` · ${archivedBy.name}` : ''}
        </span>
        <span title={formatDateTime(task.createdAt)}>создал {author?.name ?? 'бывший участник'} {timeAgo(task.createdAt)}</span>
        {assignee && (
          <span className="inline-flex items-center gap-1.5">
            <MemberAvatar member={assignee} size="xs" /> {assignee.name}
          </span>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/[0.05] pt-3 text-[12.5px] font-semibold">
        <Counter icon={MessageCircle} value={task.commentsCount} title="Комментарии" />
        <Counter icon={Bot} value={task.worksCount} title="Работы агентов в журнале" />
        <Counter icon={History} value={task.historyCount} title="Записи истории" />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="soft" size="sm" onClick={() => onRestore(task.key)}>
            <RotateCcw /> Вернуть
          </Button>
          <Button variant="danger" size="sm" onClick={() => setPurging(true)}>
            <Trash2 /> Удалить
          </Button>
        </div>
      </footer>

      <TaskPurgeDialog
        open={purging}
        onOpenChange={setPurging}
        task={task}
        worksCount={task.worksCount}
        historyCount={task.historyCount}
      />
    </li>
  );
};
