import type { Label } from '@/api/models';
import { cn } from '@/lib/utils';

interface ILabelChipsProps {
  labelIds: string[];
  labels: Map<string, Label>;
  /** Сколько показать, остальные — «+N». */
  max?: number;
  compact?: boolean;
  className?: string;
}

/** Метки задачи: цветная точка и имя (или только точки в компактном виде). */
export const LabelChips = ({ labelIds, labels, max = 3, compact = false, className }: ILabelChipsProps) => {
  const known = labelIds.map((id) => labels.get(id)).filter((label): label is Label => Boolean(label));
  if (!known.length) return null;
  const visible = known.slice(0, max);
  const rest = known.length - visible.length;

  if (compact) {
    return (
      <span className={cn('flex items-center -space-x-1', className)}>
        {known.map((label) => (
          <span key={label.id} className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: label.color }} title={label.name} />
        ))}
      </span>
    );
  }

  return (
    <span className={cn('flex min-w-0 flex-wrap items-center gap-1', className)}>
      {visible.map((label) => (
        <span
          key={label.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2 py-0.5 text-[12px] font-semibold text-ink-soft"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: label.color }} />
          {label.name}
        </span>
      ))}
      {rest > 0 && <span className="text-[12px] font-semibold text-ink-faint">+{rest}</span>}
    </span>
  );
};
