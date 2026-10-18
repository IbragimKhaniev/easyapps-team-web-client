import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImagePlus, X } from 'lucide-react';
import { useState } from 'react';

import type { MediaAsset } from '@/api/models';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../components/AssetThumb';
import { MediaPickerDialog } from './MediaPickerDialog';

const POINTER_DISTANCE_PX = 6;
const TOUCH_DELAY_MS = 180;
const TOUCH_TOLERANCE_PX = 6;

interface IMediaStripProps {
  ids: string[];
  assets: Map<string, MediaAsset>;
  max: number;
  disabled?: boolean;
  onChange: (ids: string[]) => void;
  /** Выбрали из медиатеки или загрузили — конструктор запоминает файлы для превью. */
  onAssets: (assets: MediaAsset[]) => void;
}

const SortableThumb = ({ asset, index, disabled, onRemove }: { asset: MediaAsset | undefined; index: number; disabled?: boolean; onRemove: () => void }) => {
  const id = asset?.id ?? `missing-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group relative h-24 w-24 shrink-0 touch-manipulation', isDragging && 'z-10 scale-105 opacity-90')}
      {...attributes}
      {...listeners}
    >
      <AssetThumb
        kind={asset?.kind ?? 'document'}
        thumbnailUrl={asset?.thumbnailUrl ?? null}
        durationSec={asset?.durationSec}
        alt={asset?.title}
        className="h-full w-full rounded-2xl ring-1 ring-black/[0.06]"
      />
      {index === 0 && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-ink shadow-card">Обложка</span>
      )}
      {!disabled && (
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-card transition-transform hover:scale-110"
          aria-label="Убрать файл"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

/**
 * Файлы поста: порядок — перетаскиванием (первый — обложка поста и первый
 * кадр альбома), «+» — выбрать из медиатеки или загрузить.
 */
export const MediaStrip = ({ ids, assets, max, disabled, onChange, onAssets }: IMediaStripProps) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: POINTER_DISTANCE_PX } }),
    useSensor(TouchSensor, { activationConstraint: { delay: TOUCH_DELAY_MS, tolerance: TOUCH_TOLERANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onChange(arrayMove(ids, from, to));
  };

  const add = (picked: MediaAsset[]) => {
    onAssets(picked);
    const fresh = picked.map((asset) => asset.id).filter((id) => !ids.includes(id));
    onChange([...ids, ...fresh].slice(0, max));
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 pt-2 scrollbar-none">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {ids.map((id, index) => (
            <SortableThumb
              key={id}
              asset={assets.get(id)}
              index={index}
              disabled={disabled}
              onRemove={() => onChange(ids.filter((item) => item !== id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!disabled && ids.length < max && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-brand-300 text-[12px] font-bold text-brand-800 transition-colors hover:bg-brand-50"
        >
          <ImagePlus className="h-6 w-6" />
          {ids.length ? 'Ещё файл' : 'Добавить'}
        </button>
      )}
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={ids}
        limit={max - ids.length}
        onPick={add}
      />
    </div>
  );
};
