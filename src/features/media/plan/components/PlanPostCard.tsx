import { AlertTriangle, Clock, Lightbulb } from 'lucide-react';

import type { MediaPost } from '@/api/models';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../components/AssetThumb';
import { PlatformIcon } from '../../components/PlatformIcon';
import { PostStatusPill } from '../../components/StatusPill';
import { localTimeOf } from '../../lib/calendar';
import { toPlainText } from '../../lib/markup';
import { PLATFORM_ORDER } from '../../lib/platforms';
import { TONE_DOT, TARGET_STATUS_META } from '../../lib/status';

interface IPlanPostCardProps {
  post: MediaPost;
  onOpen: (id: string) => void;
}

/** Пост в списке дня: обложка, время, название, начало текста, площадки со своими статусами. */
export const PlanPostCard = ({ post, onOpen }: IPlanPostCardProps) => {
  const isIdea = post.status === 'idea';
  const errors = post.issues.filter((issue) => issue.level === 'error').length;
  const targets = PLATFORM_ORDER
    .map((platform) => post.targets.find((target) => target.platform === platform))
    .filter((target): target is MediaPost['targets'][number] => Boolean(target?.enabled));
  const preview = toPlainText(post.text).trim();

  return (
    <button
      type="button"
      onClick={() => onOpen(post.id)}
      className={cn(
        'flex w-full gap-3 rounded-2xl p-3 text-left transition-shadow',
        isIdea ? 'border border-dashed border-ink-faint/50 bg-transparent hover:bg-white' : 'bg-white shadow-card hover:shadow-float',
      )}
    >
      {post.cover ? (
        <AssetThumb kind={post.cover.kind} thumbnailUrl={post.cover.thumbnailUrl} className="h-16 w-16 shrink-0 rounded-xl" />
      ) : (
        <span className={cn('inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-xl', isIdea ? 'bg-amber-50 text-amber-500' : 'bg-secondary text-ink-faint')}>
          {isIdea ? <Lightbulb className="h-6 w-6" /> : <span className="text-[11px] font-bold uppercase">Текст</span>}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {post.publishAt && !isIdea && (
            <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ink-soft tabular">
              <Clock className="h-3.5 w-3.5" /> {localTimeOf(post.publishAt)}
            </span>
          )}
          {post.rubric && <span className="truncate text-[12px] font-semibold text-brand-800">{post.rubric}</span>}
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-bold text-ink">{post.title}</span>
        {preview && <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-muted">{preview}</span>}
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <PostStatusPill status={post.status} />
          {targets.map((target) => (
            <span key={target.platform} className="relative" title={TARGET_STATUS_META[target.status].label}>
              <PlatformIcon platform={target.platform} size="xs" />
              {post.status !== 'draft' && post.status !== 'idea' && (
                <span className={cn('absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white', TONE_DOT[TARGET_STATUS_META[target.status].tone])} />
              )}
            </span>
          ))}
          {errors > 0 && !isIdea && (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" /> {errors === 1 ? 'не готов' : `проблем: ${errors}`}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};
