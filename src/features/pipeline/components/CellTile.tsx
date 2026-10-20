import { useRef, useState } from 'react';

import type { PipelineCell } from '@/api/models';
import { cn } from '@/lib/utils';
import { CELL_STATUS_META } from '../lib/pipelineMeta';
import { isImageFile, isVideoFile } from '../lib/mediaFiles';

interface ICellTileProps {
  cell: PipelineCell;
  label: string;
  dimmed: boolean;
  selected: boolean;
  onOpen: () => void;
  /** Клип или кадр бросили прямо на клетку. */
  onDropFile: (file: File, kind: 'clip' | 'frame') => void;
}

const MARKS: Partial<Record<PipelineCell['status'], string>> = {
  todo: 'Открыть',
  progress: 'В работе',
  rejected: 'Брак',
};

/** Клетка сетки «герой × сцена»: клип оживает при наведении, файл можно бросить прямо на неё. */
export const CellTile = ({ cell, label, dimmed, selected, onOpen, onDropFile }: ICellTileProps) => {
  const video = useRef<HTMLVideoElement>(null);
  const [over, setOver] = useState(false);
  const meta = CELL_STATUS_META[cell.status];
  const uses = cell.usedIn.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => video.current?.play().catch(() => undefined)}
      onMouseLeave={() => video.current?.pause()}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files[0];
        if (!file) return;
        if (isVideoFile(file)) onDropFile(file, 'clip');
        else if (isImageFile(file)) onDropFile(file, 'frame');
      }}
      aria-label={`${label}: ${meta.label}`}
      title={label}
      className={cn(
        'group relative h-[112px] w-[64px] shrink-0 overflow-hidden rounded-xl border bg-white transition',
        cell.status === 'done' ? 'border-emerald-200' : cell.status === 'progress' ? 'border-amber-300' : cell.status === 'rejected' ? 'border-rose-300' : 'border-black/[0.06]',
        selected && 'ring-2 ring-brand-500 ring-offset-1',
        over && 'ring-2 ring-brand-400',
        dimmed && 'opacity-25',
      )}
    >
      {cell.clip ? (
        <video ref={video} src={cell.clip} poster={cell.frame ?? undefined} muted loop playsInline preload="none" className="h-full w-full object-cover" />
      ) : cell.frame ? (
        <img src={cell.frame} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgba(17,24,39,0.03)_6px_12px)]" />
      )}
      {uses > 0 && (
        <span className="absolute right-1 top-1 rounded-full bg-ink/80 px-1.5 text-[10px] font-bold leading-4 text-white" title={`Стоит в роликах: ${cell.usedIn.join(', ')}`}>
          {uses > 1 ? `×${uses}` : cell.usedIn[0]}
        </span>
      )}
      {MARKS[cell.status] && (
        <span className={cn('absolute inset-x-1 bottom-1 rounded-md px-1 py-0.5 text-[10px] font-bold leading-3', meta.pill, cell.status === 'todo' && 'opacity-0 group-hover:opacity-100')}>
          {MARKS[cell.status]}
        </span>
      )}
    </button>
  );
};
