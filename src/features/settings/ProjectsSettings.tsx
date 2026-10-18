import { useQueryClient } from '@tanstack/react-query';
import { Archive, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { getListProjectsQueryKey, useCreateProject, useUpdateProject } from '@/api/generated/projects/projects';
import type { Project } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectBadge } from '@/features/tasks/components/ProjectBadge';
import { useProjects } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { apiErrorMessage } from '@/lib/errors';
import { TRACKER_PALETTE } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { ColorSwatches } from './ColorSwatches';

const PROJECT_ICONS = ['🚀', '📣', '🎨', '🛠', '💼', '📱', '🧪', '📈', '🎬', '🤝', '💡', '🗂'];

/** Ключ из названия: «Маркетинг» → «MKT» нельзя угадать — предлагаем латиницу из первых букв. */
const suggestKey = (name: string): string =>
  name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.slice(0, 3))
    .join('')
    .slice(0, 6);

const CreateProjectForm = ({ onDone }: { onDone: () => void }) => {
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [color, setColor] = useState<string>(TRACKER_PALETTE[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);

  const submit = async () => {
    try {
      await createProject.mutateAsync({ data: { name: name.trim(), key: key.trim().toUpperCase(), color, icon } });
      await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast.success('Проект создан');
      onDone();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось создать проект'));
    }
  };

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-secondary p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <Input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!key) setKey(suggestKey(event.target.value));
          }}
          placeholder="Название проекта"
          maxLength={80}
          className="bg-white"
          required
        />
        <Input
          value={key}
          onChange={(event) => setKey(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="Ключ, напр. SMM"
          className="bg-white font-mono"
          required
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PROJECT_ICONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setIcon(option)}
            className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl text-[18px]', icon === option ? 'bg-white shadow-card ring-2 ring-brand' : 'hover:bg-white')}
          >
            {option}
          </button>
        ))}
      </div>
      <ColorSwatches value={color} onChange={setColor} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>Отмена</Button>
        <Button type="submit" disabled={!name.trim() || key.length < 2 || createProject.isPending}>Создать</Button>
      </div>
    </form>
  );
};

const ProjectRow = ({ project, canEdit }: { project: Project; canEdit: boolean }) => {
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();

  const update = async (data: Parameters<typeof updateProject.mutateAsync>[0]['data']) => {
    try {
      await updateProject.mutateAsync({ id: project.id, data });
      await queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить проект'));
    }
  };

  return (
    <li className={cn('flex items-center gap-3 rounded-2xl px-2 py-2.5', project.archived && 'opacity-60')}>
      <ProjectBadge project={project} className="h-10 w-10 rounded-xl text-[18px]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-bold text-ink">{project.name}</div>
        <div className="text-[12.5px] text-ink-muted">
          <span className="font-mono">{project.key}</span> · открыто {project.counts.open}, закрыто {project.counts.done}
        </div>
      </div>
      {canEdit && (
        <>
          <ColorSwatches value={project.color} onChange={(color) => void update({ color })} compact />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void update({ archived: !project.archived })}
            aria-label={project.archived ? 'Вернуть из архива' : 'В архив'}
            title={project.archived ? 'Вернуть из архива' : 'В архив'}
          >
            {project.archived ? <RotateCcw /> : <Archive />}
          </Button>
        </>
      )}
    </li>
  );
};

/** Проекты: создаёт и архивирует администратор, видят все. */
export const ProjectsSettings = () => {
  const { isAdmin } = useSession();
  const { list } = useProjects(true);
  const [creating, setCreating] = useState(false);

  return (
    <Card
      title="Проекты"
      action={isAdmin && !creating ? <Button size="sm" onClick={() => setCreating(true)}><Plus /> Новый</Button> : undefined}
    >
      <div id="projects" className="flex flex-col gap-3">
        {creating && <CreateProjectForm onDone={() => setCreating(false)} />}
        <ul className="flex flex-col divide-y divide-black/[0.05]">
          {list.map((project) => (
            <ProjectRow key={project.id} project={project} canEdit={isAdmin} />
          ))}
        </ul>
        {!isAdmin && <p className="text-[13px] text-ink-faint">Проекты заводит и архивирует администратор.</p>}
      </div>
    </Card>
  );
};
