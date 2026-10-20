import type { PipelinePhase } from '@/api/models';
import { cn } from '@/lib/utils';
import { PHASE_META } from '../lib/pipelineMeta';

/** Этапы конвейера лентой: что сделано, что идёт, что впереди. */
export const PhasesStrip = ({ phases }: { phases: PipelinePhase[] }) => {
  if (!phases.length) return null;
  return (
    <ol className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {phases.map((phase) => {
        const meta = PHASE_META[phase.status ?? ''] ?? PHASE_META.todo!;
        return (
          <li key={phase.id ?? phase.title} className={cn('card-surface flex w-[240px] shrink-0 flex-col gap-1.5 p-4', phase.status === 'active' && 'ring-2 ring-brand-200')}>
            <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink-faint">
              <i className={cn('h-2 w-2 rounded-full', meta.dot)} /> {meta.label}
            </span>
            <b className="text-[15px] text-ink">{phase.title}</b>
            {phase.note && <p className="line-clamp-4 text-[13px] text-ink-muted">{phase.note}</p>}
          </li>
        );
      })}
    </ol>
  );
};
