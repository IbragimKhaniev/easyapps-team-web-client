import { Archive, Link2, MoreHorizontal, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useGetTask } from '@/api/generated/tasks/tasks';
import type { UpdateTaskBody } from '@/api/models';
import { taskHref } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useTaskRowContext } from '../../hooks/useTaskRowContext';
import { useTaskWorkCount } from '../../hooks/useTaskWorkCount';
import { ProjectBadge } from '../ProjectBadge';
import { TaskChecklist } from './TaskChecklist';
import { TaskComments } from './TaskComments';
import { TaskDescription } from './TaskDescription';
import { TaskHistory } from './TaskHistory';
import { TaskProperties } from './TaskProperties';
import { TaskTitle } from './TaskTitle';
import { TaskWork } from './TaskWork';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2.5">
    <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">{title}</h3>
    {children}
  </section>
);

interface ITaskDetailProps {
  taskKey: string;
  onClose: () => void;
}

/** Карточка задачи целиком — одна и та же в панели компьютера и в шторке телефона. */
export const TaskDetail = ({ taskKey, onClose }: ITaskDetailProps) => {
  const { data, isLoading, isError } = useGetTask(taskKey);
  const context = useTaskRowContext();
  const { updateTask, restoreTask } = useTaskActions();
  const [tab, setTab] = useState('comments');
  const task = data?.data;
  const workCount = useTaskWorkCount(taskKey);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-9 w-3/4" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (isError || !task) {
    return <EmptyState icon={X} title="Задача не найдена" description="Возможно, её ключ изменился или она удалена." action={<Button onClick={onClose}>Закрыть</Button>} />;
  }

  const project = context.projects.get(task.projectId);
  const change = (patch: UpdateTaskBody) => void updateTask(task.key, patch);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${taskHref(task.key)}`);
    toast.success('Ссылка скопирована');
  };

  const archive = async () => {
    await context.onArchive(task);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-white/90 px-5 py-3 backdrop-blur-xl md:px-6">
        {project && <ProjectBadge project={project} />}
        <span className="font-mono text-[13px] font-semibold text-ink-muted">{task.key}</span>
        {task.archivedAt && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[12px] font-bold text-zinc-500">в архиве</span>}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => void copyLink()} aria-label="Скопировать ссылку" title="Скопировать ссылку">
            <Link2 />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ещё">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.archivedAt ? (
                <DropdownMenuItem onSelect={() => void restoreTask(task.key)}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Вернуть из архива
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => void archive()} className="text-rose-600">
                  <Archive className="mr-2 h-4 w-4" /> В архив
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="soft" size="icon-sm" onClick={onClose} aria-label="Закрыть">
            <X />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-1 md:px-6">
        <TaskTitle value={task.title} onSave={(title) => change({ title })} />
        <TaskProperties task={task} context={context} onChange={change} />

        <Section title="Описание">
          <TaskDescription value={task.description} onSave={(description) => change({ description })} />
        </Section>

        <Section title="Чек-лист">
          <TaskChecklist items={task.checklist} onChange={(checklist) => change({ checklist })} />
        </Section>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-10 w-full justify-start gap-1 rounded-full bg-secondary p-1">
            {[
              { value: 'comments', label: `Комментарии${task.commentsCount ? ` · ${task.commentsCount}` : ''}` },
              { value: 'work', label: `Агенты${workCount ? ` · ${workCount}` : ''}` },
              { value: 'history', label: 'История' },
            ].map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn('h-8 flex-1 rounded-full text-[13.5px] font-bold data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card')}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="comments" className="mt-4">
            <TaskComments taskKey={task.key} />
          </TabsContent>
          <TabsContent value="work" className="mt-4">
            <TaskWork taskKey={task.key} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <TaskHistory taskKey={task.key} />
          </TabsContent>
        </Tabs>

        <p className="text-center text-[12px] text-ink-faint">
          Создана {timeAgo(task.createdAt)} · обновлена {timeAgo(task.updatedAt)}
        </p>
      </div>
    </div>
  );
};
