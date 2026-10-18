import type { MediaPostStatus, MediaTargetStatus } from '@/api/models';
import { cn } from '@/lib/utils';
import { POST_STATUS_META, TARGET_STATUS_META, TONE_CLASSES, type IStatusMeta } from '../lib/status';

interface IPillProps {
  meta: IStatusMeta;
  className?: string;
}

const Pill = ({ meta, className }: IPillProps) => (
  <span
    className={cn(
      'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-bold',
      TONE_CLASSES[meta.tone],
      className,
    )}
  >
    {meta.tone === 'progress' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
    {meta.label}
  </span>
);

export const PostStatusPill = ({ status, className }: { status: MediaPostStatus; className?: string }) => (
  <Pill meta={POST_STATUS_META[status]} className={className} />
);

export const TargetStatusPill = ({ status, className }: { status: MediaTargetStatus; className?: string }) => (
  <Pill meta={TARGET_STATUS_META[status]} className={className} />
);
