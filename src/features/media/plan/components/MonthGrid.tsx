import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { MediaPost } from '@/api/models';
import { cn } from '@/lib/utils';
import { WEEKDAY_SHORT, type ICalendarDay } from '../../lib/calendar';
import { PostChip, PostChipView } from './PostChip';

/** В клетке помещается столько постов, остальное — «ещё N». */
const VISIBLE_PER_DAY = 3;
const DRAG_DISTANCE_PX = 6;

interface IMonthGridProps {
  weeks: ICalendarDay[][];
  postsOf: (day: ICalendarDay) => MediaPost[];
  selected: string;
  onSelect: (iso: string) => void;
  onOpen: (id: string) => void;
  onCreate: (iso: string) => void;
  onMove: (post: MediaPost, iso: string) => void;
}

const DayCell = ({ day, posts, selected, onSelect, onOpen, onCreate }: {
  day: ICalendarDay;
  posts: MediaPost[];
  selected: boolean;
  onSelect: (iso: string) => void;
  onOpen: (id: string) => void;
  onCreate: (iso: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: day.iso });
  const hidden = posts.length - VISIBLE_PER_DAY;

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(day.iso)}
      onDoubleClick={() => onCreate(day.iso)}
      onKeyDown={(event) => event.key === 'Enter' && onSelect(day.iso)}
      className={cn(
        'group relative flex min-h-[124px] flex-col gap-1 rounded-2xl p-2 text-left outline-none transition-colors',
        day.inMonth ? 'bg-secondary/70' : 'bg-transparent',
        selected && 'bg-brand-50 ring-2 ring-brand-300',
        isOver && 'bg-brand-100 ring-2 ring-brand-500',
        'focus-visible:ring-2 focus-visible:ring-brand-400',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-[13px] font-bold tabular',
            day.isToday ? 'bg-ink text-white' : day.inMonth ? (day.isWeekend ? 'text-ink-muted' : 'text-ink') : 'text-ink-faint',
          )}
        >
          {day.day}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onCreate(day.iso);
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-muted opacity-0 transition-opacity hover:bg-white hover:text-ink group-hover:opacity-100"
          aria-label="Новый пост в этот день"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {posts.slice(0, VISIBLE_PER_DAY).map((post) => <PostChip key={post.id} post={post} onOpen={onOpen} />)}
        {hidden > 0 && <span className="px-1.5 text-[11.5px] font-bold text-ink-muted">ещё {hidden}</span>}
      </div>
    </div>
  );
};

/** Месяц сеткой: посты по дням, двойной клик — новый пост, пост можно перетащить на другой день. */
export const MonthGrid = ({ weeks, postsOf, selected, onSelect, onOpen, onCreate, onMove }: IMonthGridProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }));
  const [dragging, setDragging] = useState<MediaPost | null>(null);

  const onDragStart = ({ active }: DragStartEvent) => setDragging((active.data.current?.post as MediaPost | undefined) ?? null);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    const post = active.data.current?.post as MediaPost | undefined;
    if (post && over) onMove(post, String(over.id));
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_SHORT.map((weekday, index) => (
          <div key={weekday} className={cn('px-2 pb-1 text-[12px] font-bold uppercase tracking-wide', index > 4 ? 'text-ink-faint' : 'text-ink-muted')}>
            {weekday}
          </div>
        ))}
        {weeks.flat().map((day) => (
          <DayCell
            key={day.iso}
            day={day}
            posts={postsOf(day)}
            selected={selected === day.iso}
            onSelect={onSelect}
            onOpen={onOpen}
            onCreate={onCreate}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {dragging && (
          <div className="w-44 rotate-2">
            <PostChipView post={dragging} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
