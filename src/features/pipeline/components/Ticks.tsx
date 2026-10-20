import type { PipelineCell, PipelineScene } from '@/api/models';
import { cn } from '@/lib/utils';
import { CELL_STATUS_META } from '../lib/pipelineMeta';

interface ITicksProps {
  cells: PipelineCell[];
  sceneBy: Map<string, PipelineScene>;
  className?: string;
}

/** Клипы героя полоской отметок: цвет — статус клетки, подсказка — сцена. */
export const Ticks = ({ cells, sceneBy, className }: ITicksProps) => (
  <div className={cn('flex flex-wrap gap-[3px]', className)}>
    {cells.map((cell) => (
      <i
        key={cell.key}
        className={cn('h-3 w-1.5 rounded-full', CELL_STATUS_META[cell.status].tick)}
        title={`${sceneBy.get(cell.scene)?.title ?? cell.scene}: ${CELL_STATUS_META[cell.status].label}`}
      />
    ))}
  </div>
);
