import { ArrowUp, CalendarDays, Tag } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { TaskPriority, TaskStatus, type CreateTaskBody } from '@/api/models';
import { uiActions, useUiState } from '@/app/uiStore';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useLabels, useMembers, useProjects } from '@/hooks/useDirectory';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { todayIso } from '@/lib/dates';
import { PRIORITY_META, STATUS_META } from '@/lib/tracker';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskParam } from '../hooks/useTaskParam';
import { AssigneePicker } from '../pickers/AssigneePicker';
import { DueDatePicker } from '../pickers/DueDatePicker';
import { LabelPicker } from '../pickers/LabelPicker';
import { PriorityPicker } from '../pickers/PriorityPicker';
import { ProjectPicker } from '../pickers/ProjectPicker';
import { StatusPicker } from '../pickers/StatusPicker';
import { DueChip } from './DueChip';
import { PriorityIcon } from './PriorityIcon';
import { ProjectBadge } from './ProjectBadge';
import { StatusIcon } from './StatusIcon';

const Pill = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-black/[0.07] bg-white px-3 text-[13.5px] font-semibold text-ink transition-colors hover:bg-secondary"
    {...props}
  >
    {children}
  </button>
);

interface IDraft {
  title: string;
  description: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  labelIds: string[];
}

const emptyDraft = (defaults: Partial<IDraft>): IDraft => ({
  title: '',
  description: '',
  status: TaskStatus.todo,
  priority: TaskPriority.none,
  assigneeId: null,
  dueDate: null,
  labelIds: [],
  ...defaults,
});

/**
 * Быстрое добавление задачи — как карточка Things: только название, всё
 * остальное — капсулами по требованию. Enter создаёт, ⌘Enter — создаёт и
 * оставляет форму открытой для следующей.
 */
export const QuickAddTask = () => {
  const { open, defaults } = useUiState((state) => state.quickAdd);
  const isDesktop = useIsDesktop();
  const { list: projects } = useProjects();
  const { map: members } = useMembers();
  useLabels();
  const { createTask, isCreating } = useTaskActions();
  const { openTask } = useTaskParam();
  const [draft, setDraft] = useState<IDraft>(() => emptyDraft({}));
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const today = todayIso();

  useEffect(() => {
    if (!open) return;
    setDraft(emptyDraft({
      ...defaults,
      assigneeId: defaults.assigneeId ?? null,
      dueDate: defaults.dueDate ?? null,
      projectId: defaults.projectId ?? projects[0]?.id,
    }));
    // Фокус — после анимации появления, иначе iOS не поднимает клавиатуру.
    const timer = window.setTimeout(() => titleRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open, defaults, projects]);

  const project = useMemo(() => projects.find((item) => item.id === draft.projectId), [projects, draft.projectId]);
  const assignee = draft.assigneeId ? members.get(draft.assigneeId) : null;
  const patch = (next: Partial<IDraft>) => setDraft((current) => ({ ...current, ...next }));

  const submit = async (keepOpen: boolean) => {
    const title = draft.title.trim();
    if (!title || !draft.projectId) return;
    const body: CreateTaskBody = {
      projectId: draft.projectId,
      title,
      description: draft.description.trim() || undefined,
      status: draft.status,
      priority: draft.priority,
      assigneeId: draft.assigneeId,
      dueDate: draft.dueDate,
      labelIds: draft.labelIds,
    };
    const created = await createTask(body);
    if (!created) return;
    toast.success(`${created.key} создана`, { action: { label: 'Открыть', onClick: () => openTask(created.key) } });
    if (keepOpen) {
      patch({ title: '', description: '' });
      titleRef.current?.focus();
    } else {
      uiActions.closeQuickAdd();
    }
  };

  const form = (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(false);
      }}
    >
      <textarea
        ref={titleRef}
        value={draft.title}
        rows={1}
        onChange={(event) => patch({ title: event.target.value.replace(/\n/g, ' ') })}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            void submit(event.metaKey || event.ctrlKey);
          }
        }}
        placeholder="Название задачи"
        maxLength={300}
        enterKeyHint="send"
        className="w-full resize-none bg-transparent text-[20px] font-bold leading-snug text-ink outline-none placeholder:text-ink-faint"
      />
      <textarea
        value={draft.description}
        rows={2}
        onChange={(event) => patch({ description: event.target.value })}
        placeholder="Заметка (необязательно)"
        className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink-soft outline-none placeholder:text-ink-faint"
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
        <ProjectPicker
          value={draft.projectId}
          onChange={(projectId) => patch({ projectId })}
          trigger={<Pill>{project && <ProjectBadge project={project} className="h-5 w-5 text-[11px]" />}{project?.name ?? 'Проект'}</Pill>}
        />
        <StatusPicker
          value={draft.status}
          onChange={(status) => patch({ status })}
          trigger={<Pill><StatusIcon status={draft.status} />{STATUS_META[draft.status].short}</Pill>}
        />
        <AssigneePicker
          value={draft.assigneeId}
          onChange={(assigneeId) => patch({ assigneeId })}
          trigger={<Pill><MemberAvatar member={assignee} size="xs" />{assignee?.name.split(' ')[0] ?? 'Исполнитель'}</Pill>}
        />
        <DueDatePicker
          value={draft.dueDate}
          onChange={(dueDate) => patch({ dueDate })}
          trigger={
            draft.dueDate ? (
              <button type="button" className="shrink-0"><DueChip dueDate={draft.dueDate} today={today} className="h-9 px-3 text-[13.5px]" /></button>
            ) : (
              <Pill><CalendarDays className="h-4 w-4 text-ink-muted" />Срок</Pill>
            )
          }
        />
        <PriorityPicker
          value={draft.priority}
          onChange={(priority) => patch({ priority })}
          trigger={<Pill><PriorityIcon priority={draft.priority} />{draft.priority === 'none' ? 'Приоритет' : PRIORITY_META[draft.priority].label}</Pill>}
        />
        <LabelPicker
          value={draft.labelIds}
          onChange={(labelIds) => patch({ labelIds })}
          trigger={<Pill><Tag className="h-4 w-4 text-ink-muted" />{draft.labelIds.length ? `Метки · ${draft.labelIds.length}` : 'Метки'}</Pill>}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] pt-3">
        <span className="hidden text-[12px] text-ink-faint md:block">Enter — создать · ⌘Enter — создать и ещё одну</span>
        <Button type="submit" disabled={!draft.title.trim() || !draft.projectId || isCreating} className="ml-auto">
          Создать
          <ArrowUp />
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && uiActions.closeQuickAdd()}>
        <DialogContent className="max-w-xl gap-0 p-5" showCloseButton={false}>
          <DialogTitle className="sr-only">Новая задача</DialogTitle>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && uiActions.closeQuickAdd()}>
      <DrawerContent>
        <DrawerTitle className="sr-only">Новая задача</DrawerTitle>
        <div className="px-5 pb-3 pt-2">{form}</div>
      </DrawerContent>
    </Drawer>
  );
};
