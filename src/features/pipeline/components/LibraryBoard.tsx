import type { PipelineCellStatus } from '@/api/models';
import type { IPipelineBoard, IPipelineLookups } from '../hooks/usePipelineData';
import { CellTile } from './CellTile';

interface ILibraryBoardProps {
  board: IPipelineBoard;
  lookups: IPipelineLookups;
  filter: PipelineCellStatus | null;
  openCell: string | null;
  onOpenCell: (key: string) => void;
  onOpenHero: (key: string) => void;
  onDropFile: (cell: string, file: File, kind: 'clip' | 'frame') => void;
}

const LABEL_WIDTH = 168;
const TILE_WIDTH = 64;

/** Доска «герои × сцены одной группы»: строка — герой, столбец — сцена. */
export const LibraryBoard = ({ board, lookups, filter, openCell, onOpenCell, onOpenHero, onDropFile }: ILibraryBoardProps) => (
  <div className="overflow-x-auto pb-2 scrollbar-none">
    <div
      className="grid gap-x-2 gap-y-2"
      style={{ gridTemplateColumns: `${LABEL_WIDTH}px repeat(${board.scenes.length}, ${TILE_WIDTH}px)` }}
    >
      <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">{board.title}</div>
      {board.scenes.map((scene) => (
        <div key={scene.key} className="flex items-end pb-1 text-[11px] font-semibold leading-tight text-ink-muted" title={scene.data.ru ?? scene.title}>
          <span className="line-clamp-3">{scene.title}</span>
        </div>
      ))}
      {board.heroes.map((hero) => {
        const cells = lookups.cellsOf(hero.key);
        const done = cells.filter((cell) => cell.status === 'done').length;
        return (
          <div key={hero.key} className="contents">
            <button
              type="button"
              onClick={() => onOpenHero(hero.key)}
              className="flex flex-col items-start justify-center gap-0.5 rounded-xl border-l-4 bg-white px-3 text-left shadow-card"
              style={{ borderLeftColor: hero.data.color ?? '#9CA3AF' }}
            >
              <b className="text-[14px] text-ink">{hero.name}</b>
              <span className="line-clamp-1 text-[12px] text-ink-muted">{hero.data.profession ?? hero.data.role ?? ''}</span>
              <em className="text-[12px] not-italic text-ink-faint">{done} из {cells.length}</em>
            </button>
            {board.scenes.map((scene) => {
              const cell = lookups.cellBy.get(`${hero.key}/${scene.key}`);
              if (!cell) return <div key={scene.key} />;
              return (
                <CellTile
                  key={cell.key}
                  cell={cell}
                  label={`${hero.name}: ${scene.title}`}
                  dimmed={Boolean(filter && filter !== cell.status)}
                  selected={openCell === cell.key}
                  onOpen={() => onOpenCell(cell.key)}
                  onDropFile={(file, kind) => onDropFile(cell.key, file, kind)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  </div>
);
