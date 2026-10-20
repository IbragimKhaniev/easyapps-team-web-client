import { PipelineCellStatus, type PipelineState } from '@/api/models';
import { cn } from '@/lib/utils';
import { LibraryBoard } from '../components/LibraryBoard';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { CELL_STATUS_META } from '../lib/pipelineMeta';

interface ILibraryTabProps {
  state: PipelineState;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  filter: PipelineCellStatus | null;
  openCell: string | null;
  onFilter: (status: PipelineCellStatus | null) => void;
  onOpenCell: (key: string) => void;
  onOpenHero: (key: string) => void;
}

const spec = (state: PipelineState, key: string, fallback: string) => String(state.spec[key] ?? fallback);

/** Библиотека клипов: каждый герой в своих типовых сценах; клип перетаскивают прямо на клетку. */
export const LibraryTab = ({ state, lookups, actions, filter, openCell, onFilter, onOpenCell, onOpenHero }: ILibraryTabProps) => (
  <div className="flex flex-col gap-5">
    <p className="text-[14px] text-ink-muted">
      Клипы {spec(state, 'aspect', '9:16')}, {spec(state, 'seconds', '5')} секунд, без звука: кадр — {spec(state, 'image_model', 'Nano Banana 2')},
      движение — {spec(state, 'video_model', 'Kling 3.0')}. Ролик собирается из частей: что уже снято — берём в новые ролики, новое снимаем так,
      чтобы пригодилось потом. Значок в углу клетки — в каких роликах клип уже стоит.
    </p>
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={() => onFilter(null)} className={cn('h-8 rounded-full px-3 text-[13px] font-bold', !filter ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card')}>
        Все {state.cells.length}
      </button>
      {Object.values(PipelineCellStatus).map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onFilter(filter === status ? null : status)}
          className={cn('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold', filter === status ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card')}
        >
          <i className={cn('h-2.5 w-2.5 rounded-full', CELL_STATUS_META[status].tick)} />
          {CELL_STATUS_META[status].label} {lookups.cellCounts[status]}
        </button>
      ))}
    </div>
    {lookups.boards.map((board) => (
      <section key={board.group} className="card-surface p-4 lg:p-5">
        <LibraryBoard
          board={board}
          lookups={lookups}
          filter={filter}
          openCell={openCell}
          onOpenCell={onOpenCell}
          onOpenHero={onOpenHero}
          onDropFile={(cell, file, kind) => (kind === 'clip' ? actions.uploadClip(cell, file) : actions.uploadFrame(cell, file))}
        />
      </section>
    ))}
  </div>
);
