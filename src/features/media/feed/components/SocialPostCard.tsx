import { CalendarCheck } from 'lucide-react';

import type { SocialPost } from '@/api/models';
import { formatDateTime } from '@/lib/dates';
import { AssetThumb } from '../../components/AssetThumb';
import { MetricsRow } from '../../components/MetricsRow';
import { PlatformIcon } from '../../components/PlatformIcon';
import { CONTENT_TYPE_LABELS, formatPercent } from '../../lib/format';
import { PLATFORM_META } from '../../lib/platforms';

interface ISocialPostCardProps {
  post: SocialPost;
  onOpen: (id: string) => void;
}

const VISUAL_TYPES = new Set(['photo', 'video', 'album', 'reel', 'story']);

/** Пост площадки в ленте: превью, площадка и время, текст, счётчики и вовлечённость. */
export const SocialPostCard = ({ post, onOpen }: ISocialPostCardProps) => (
  <button
    type="button"
    onClick={() => onOpen(post.id)}
    className="flex w-full gap-4 rounded-card bg-white p-4 text-left shadow-card transition-shadow hover:shadow-float"
  >
    <AssetThumb
      kind={post.contentType === 'video' || post.contentType === 'reel' ? 'video' : VISUAL_TYPES.has(post.contentType) ? 'image' : 'document'}
      thumbnailUrl={post.previewUrl}
      className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28"
    />
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex flex-wrap items-center gap-2 text-[12.5px] text-ink-muted">
        <PlatformIcon platform={post.platform} size="xs" />
        <span className="font-semibold text-ink-soft">{PLATFORM_META[post.platform].title}</span>
        <span>·</span>
        <span>{formatDateTime(post.publishedAt)}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-ink-soft">{CONTENT_TYPE_LABELS[post.contentType]}</span>
        {post.teamPostId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800">
            <CalendarCheck className="h-3 w-3" /> Из плана
          </span>
        )}
      </span>
      <span className="line-clamp-2 text-[14px] leading-snug text-ink">{post.text || <span className="text-ink-faint">Без текста</span>}</span>
      <span className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <MetricsRow metrics={post.metrics} platform={post.platform} />
        {post.engagementRate !== null && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-bold text-emerald-700 tabular" title="Вовлечённость">
            ER {formatPercent(post.engagementRate)}
          </span>
        )}
      </span>
    </span>
  </button>
);
