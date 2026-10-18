import { CalendarDays, CircleDot, Flag, FolderKanban, Tag, User } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import type { TaskDetail, UpdateTaskBody } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { formatLongDate } from '@/lib/dates';
import { PRIORITY_META, STATUS_META } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { AssigneePicker } from '../../pickers/AssigneePicker';
import { DueDatePicker } from '../../pickers/DueDatePicker';
import { LabelPicker } from '../../pickers/LabelPicker';
import { PriorityPicker } from '../../pickers/PriorityPicker';
import { ProjectPicker } from '../../pickers/ProjectPicker';
import { StatusPicker } from '../../pickers/StatusPicker';
import { DueChip } from '../DueChip';
import { LabelChips } from '../LabelChips';
import { PriorityIcon } from '../PriorityIcon';
import { ProjectBadge } from '../ProjectBadge';
import { StatusIcon } from '../StatusIcon';
import type { ITaskRowContext } from '../TaskRow';

/** Значение свойства — кнопка: нажал — открылся выбор (как капсулы в Linear на iPhone). */
const ValueButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'inline-flex min-h-9 max-w-full items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[14px] font-semibold text-ink transition-colors hover:border-black/15 hover:bg-secondary',
      className,
    )}
    {...props}
  />
));
ValueButton.displayName = 'ValueButton';

const Row = ({ icon: Icon, label, children }: { icon: typeof Flag; label: string; children: ReactNode }) => (
  <div className="flex min-h-11 items-center gap-3">
    <span className="flex w-28 shrink-0 items-center gap-2 text-[13.5px] font-medium text-ink-muted">
      <Icon className="h-4 w-4" />
      {label}
    </span>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

interface ITaskPropertiesProps {
  task: TaskDetail;
  context: ITaskRowContext;
  onChange: (patch: UpdateTaskBody) => void;
}

/** Свойства задачи: статус, приоритет, исполнитель, срок, проект, метки. */
export const TaskProperties = ({ task, context, onChange }: ITaskPropertiesProps) => {
  const assignee = task.assigneeId ? context.members.get(task.assigneeId) : null;
  const project = context.projects.get(task.projectId);

  return (
    <div className="flex flex-col">
      <Row icon={CircleDot} label="Статус">
        <StatusPicker
          value={task.status}
          onChange={(status) => onChange({ status })}
          trigger={
            <ValueButton>
              <StatusIcon status={task.status} />
              {STATUS_META[task.status].label}
            </ValueButton>
          }
        />
      </Row>
      <Row icon={Flag} label="Приоритет">
        <PriorityPicker
          value={task.priority}
          onChange={(priority) => onChange({ priority })}
          trigger={
            <ValueButton>
              <PriorityIcon priority={task.priority} />
              {PRIORITY_META[task.priority].label}
            </ValueButton>
          }
        />
      </Row>
      <Row icon={User} label="Исполнитель">
        <AssigneePicker
          value={task.assigneeId}
          onChange={(assigneeId) => onChange({ assigneeId })}
          trigger={
            <ValueButton>
              <MemberAvatar member={assignee} size="xs" />
              <span className="truncate">{assignee?.name ?? 'Не назначен'}</span>
            </ValueButton>
          }
        />
      </Row>
      <Row icon={CalendarDays} label="Срок">
        <DueDatePicker
          value={task.dueDate}
          onChange={(dueDate) => onChange({ dueDate })}
          trigger={
            task.dueDate ? (
              <button type="button" className="rounded-full" title={formatLongDate(task.dueDate)}>
                <DueChip dueDate={task.dueDate} today={context.today} className="h-9 px-3 text-[13.5px]" />
              </button>
            ) : (
              <ValueButton className="text-ink-muted">Без срока</ValueButton>
            )
          }
        />
      </Row>
      <Row icon={FolderKanban} label="Проект">
        <ProjectPicker
          value={task.projectId}
          onChange={(projectId) => onChange({ projectId })}
          trigger={
            <ValueButton>
              {project && <ProjectBadge project={project} className="h-5 w-5 text-[11px]" />}
              <span className="truncate">{project?.name ?? '—'}</span>
            </ValueButton>
          }
        />
      </Row>
      <Row icon={Tag} label="Метки">
        <LabelPicker
          value={task.labelIds}
          onChange={(labelIds) => onChange({ labelIds })}
          trigger={
            <button type="button" className="flex min-h-9 max-w-full items-center rounded-full text-left">
              {task.labelIds.length ? (
                <LabelChips labelIds={task.labelIds} labels={context.labels} max={6} />
              ) : (
                <span className="inline-flex min-h-9 items-center rounded-full border border-black/[0.07] bg-white px-3 text-[14px] font-semibold text-ink-muted hover:bg-secondary">
                  Добавить
                </span>
              )}
            </button>
          }
        />
      </Row>
    </div>
  );
};
