import { Link } from 'react-router-dom';

import type { SocialPost } from '@/api/models';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { formatLongDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../components/AssetThumb';
import { PlatformIcon } from '../../components/PlatformIcon';
import { formatCompact, formatPercent } from '../../lib/format';

/** Лучшие посты периода по охвату (или просмотрам) — ссылка на пост в ленте. */
export const TopPostsCard = ({ posts, wide = false }: { posts: SocialPost[]; wide?: boolean }) => (
  <Card
    title="Лучшие посты"
    action={<Link to={`${PATHS.media.feed}?sort=views`} className="text-[13px] font-semibold text-brand-800 hover:underline">Вся лента</Link>}
    className="h-full"
  >
    {posts.length ? (
      <ol className={cn('flex flex-col gap-2', wide && 'lg:grid lg:grid-cols-2 lg:gap-x-6')}>
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link to={`${PATHS.media.feed}?item=${post.id}`} className="flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-secondary">
              <span className="w-5 text-center text-[13px] font-extrabold text-ink-faint tabular">{index + 1}</span>
              <AssetThumb kind="image" thumbnailUrl={post.previewUrl} className="h-11 w-11 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{post.text || 'Без текста'}</span>
                <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                  <PlatformIcon platform={post.platform} size="xs" bare /> {formatLongDate(post.publishedAt.slice(0, 10))}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[14px] font-extrabold text-ink tabular">{formatCompact(post.metrics.reach ?? post.metrics.views)}</span>
                <span className="block text-[11.5px] font-semibold text-emerald-600 tabular">ER {formatPercent(post.engagementRate)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    ) : (
      <p className="text-[13px] text-ink-muted">За период постов не было.</p>
    )}
  </Card>
);
