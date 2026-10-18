import type { PlatformSummary } from '@/api/models';
import { Card } from '@/components/common/Card';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '../../components/PlatformIcon';
import { formatCompact, formatDelta, formatPercent } from '../../lib/format';
import { PLATFORM_META } from '../../lib/platforms';

/** Площадки рядом: подписчики и прирост, посты, просмотры, вовлечённость и когда обновлялось. */
export const PlatformsCard = ({ platforms, onPick }: { platforms: PlatformSummary[]; onPick: (platform: PlatformSummary['platform']) => void }) => (
  <Card title="Площадки" className="h-full">
    <div className="flex flex-col divide-y divide-black/[0.06]">
      {platforms.map((item) => (
        <button key={item.platform} type="button" onClick={() => onPick(item.platform)} className="flex items-center gap-3 py-3 text-left first:pt-0 last:pb-0">
          <PlatformIcon platform={item.platform} size="md" />
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-bold text-ink">{PLATFORM_META[item.platform].title}</span>
            <span className="block truncate text-[12px] text-ink-muted">
              {item.updatedAt ? `обновлено ${timeAgo(item.updatedAt)}` : 'ещё не собиралось'}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[17px] font-extrabold text-ink tabular">{formatCompact(item.followers)}</span>
            <span className={cn('block text-[12px] font-bold tabular', (item.followersDelta ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {formatDelta(item.followersDelta)}
            </span>
          </span>
          <span className="hidden w-28 text-right text-[12px] text-ink-muted sm:block">
            {item.posts} постов<br />ER {formatPercent(item.engagementRate)}
          </span>
        </button>
      ))}
    </div>
  </Card>
);
