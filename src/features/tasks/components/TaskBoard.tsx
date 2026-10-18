import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { Task, TaskStatus } from '@/api/models';
import { uiActions } from '@/app/uiStore';
import { BOARD_STATUSES, STATUS_META } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { useTaskActions } from '../hooks/useTaskActions';
import { columnOf, placementOf, toColumns, type TBoardColumns } from '../lib/boardColumns';
import { StatusIcon } from './StatusIcon';
import { TaskCard } from './TaskCard';
import type { ITaskRowContext } from './TaskRow';

/** На телефоне перенос — по долгому нажатию, иначе он спорит с прокруткой. */
const TOUCH_DELAY_MS = 220;
const TOUCH_TOLERANCE_PX = 8;
const POINTER_DISTANCE_PX = 6;

const SortableCard = ({ task, context }: { task: Task; context: ITaskRowContext }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.key });
  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      context={context}
      placeholder={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => context.onOpen(task.key)}
      {...attributes}
      {...listeners}
    />
  );
};

interface IColumnProps {
  status: TaskStatus;
  tasks: Task[];
  context: ITaskRowContext;
  projectId?: string;
}

const Column = ({ status, tasks, context, projectId }: IColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];

  return (
    <section
      className={cn(
        'flex shrink-0 snap-start flex-col rounded-card p-2.5 transition-colors',
        context.isDesktop ? 'w-[300px]' : 'w-[84vw] max-w-[360px]',
        isOver ? 'bg-brand-50' : 'bg-white/55',
      )}
    >
      <header className="mb-2 flex items-center gap-2 px-2 py-1.5">
        <StatusIcon status={status} />
        <span className="text-[14px] font-bold text-ink">{meta.label}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-ink-muted tabular shadow-card">{tasks.length}</span>
        <button
          type="button"
          onClick={() => uiActions.openQuickAdd({ status, projectId })}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-white hover:text-ink"
          aria-label={`Новая задача: ${meta.label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>
      <SortableContext items={tasks.map((task) => task.key)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto px-0.5 pb-2 scrollbar-none">
          {tasks.map((task) => (
            <SortableCard key={task.key} task={task} context={context} />
          ))}
          {!tasks.length && (
            <button
              type="button"
              onClick={() => uiActions.openQuickAdd({ status, projectId })}
              className="bg-hatched flex h-24 items-center justify-center rounded-2xl text-[13px] font-semibold text-brand-900"
            >
              <span className="rounded-full bg-white px-3 py-1 shadow-card">+ Задача</span>
            </button>
          )}
        </div>
      </SortableContext>
    </section>
  );
};

interface ITaskBoardProps {
  tasks: Task[];
  context: ITaskRowContext;
  projectId?: string;
}

/**
 * Доска: колонки по статусам, перенос карточек между колонками и внутри.
 * Порядок сохраняется дробными индексами — сервер получает соседей, а
 * карточка встаёт на место сразу.
 */
export const TaskBoard = ({ tasks, context, projectId }: ITaskBoardProps) => {
  const { moveTask } = useTaskActions();
  const serverColumns = useMemo(() => toColumns(tasks), [tasks]);
  const [columns, setColumns] = useState<TBoardColumns>(serverColumns);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [originStatus, setOriginStatus] = useState<TaskStatus | null>(null);

  // Пока ничего не тащим, доска показывает данные сервера.
  useEffect(() => {
    if (!activeKey) setColumns(serverColumns);
  }, [serverColumns, activeKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: POINTER_DISTANCE_PX } }),
    useSensor(TouchSensor, { activationConstraint: { delay: TOUCH_DELAY_MS, tolerance: TOUCH_TOLERANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeTask = activeKey ? tasks.find((task) => task.key === activeKey) : undefined;

  const onDragStart = ({ active }: DragStartEvent) => {
    const key = String(active.id);
    setActiveKey(key);
    setOriginStatus(columnOf(columns, key) ?? null);
    navigator.vibrate?.(8);
  };

  // Карточка пересекла колонку — переносим её в состояние доски сразу.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(columns, String(active.id));
    const to = columnOf(columns, String(over.id));
    if (!from || !to || from === to) return;
    setColumns((current) => {
      const moving = current[from].find((task) => task.key === active.id);
      if (!moving) return current;
      const target = current[to];
      const overIndex = target.findIndex((task) => task.key === over.id);
      const insertAt = overIndex >= 0 ? overIndex : target.length;
      return {
        ...current,
        [from]: current[from].filter((task) => task.key !== active.id),
        [to]: [...target.slice(0, insertAt), { ...moving, status: to }, ...target.slice(insertAt)],
      };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const key = String(active.id);
    const status = columnOf(columns, key);
    setActiveKey(null);
    if (!over || !status) {
      setColumns(serverColumns);
      return;
    }

    let column = columns[status];
    const from = column.findIndex((task) => task.key === key);
    const to = column.findIndex((task) => task.key === over.id);
    if (to >= 0 && from !== to) {
      column = arrayMove(column, from, to);
      setColumns((current) => ({ ...current, [status]: column }));
    } else if (status === originStatus && (to === from || over.id === status)) {
      return; // отпустили на месте
    }

    const placement = placementOf(column, status, key);
    void moveTask(key, { status: placement.status, prevKey: placement.prevKey, nextKey: placement.nextKey }, placement.rank);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveKey(null);
        setColumns(serverColumns);
      }}
    >
      <div
        className={cn(
          'flex gap-3 overflow-x-auto pb-4',
          context.isDesktop ? 'min-h-[60vh]' : 'snap-x snap-mandatory scroll-px-4 px-4 scrollbar-none',
        )}
      >
        {BOARD_STATUSES.map((status) => (
          <Column key={status} status={status} tasks={columns[status]} context={context} projectId={projectId} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeTask && <TaskCard task={activeTask} context={context} lifted />}
      </DragOverlay>
    </DndContext>
  );
};
