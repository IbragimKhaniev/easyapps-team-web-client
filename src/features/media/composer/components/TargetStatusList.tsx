import { ExternalLink, RotateCcw } from 'lucide-react';

import type { PostTarget, SocialPlatform } from '@/api/models';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/dates';
import { PlatformIcon } from '../../components/PlatformIcon';
import { TargetStatusPill } from '../../components/StatusPill';
import { PLATFORM_META } from '../../lib/platforms';

interface ITargetStatusListProps {
  targets: PostTarget[];
  busy?: boolean;
  onRetry: (platform: SocialPlatform) => void;
}

/** Как прошла публикация на каждой площадке: ссылка на вышедший пост, ошибка и «Повторить». */
export const TargetStatusList = ({ targets, busy, onRetry }: ITargetStatusListProps) => {
  const active = targets.filter((target) => target.enabled && target.status !== 'skipped');
  if (!active.length) return null;
  return (
    <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-secondary">
      {active.map((target) => (
        <div key={target.platform} className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <PlatformIcon platform={target.platform} size="sm" />
            <span className="flex-1 text-[14px] font-bold text-ink">{PLATFORM_META[target.platform].title}</span>
            <TargetStatusPill status={target.status} />
          </div>
          {target.status === 'published' && (
            <div className="flex flex-wrap items-center gap-3 pl-10 text-[13px] text-ink-muted">
              {target.publishedAt && <span>{formatDateTime(target.publishedAt)}</span>}
              {target.externalUrl && (
                <a href={target.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-800 hover:underline">
                  Открыть пост <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
          {target.error && target.status !== 'published' && (
            <p className="pl-10 text-[13px] leading-snug text-rose-700">
              {target.error}
              {target.status === 'pending' && target.nextAttemptAt && (
                <span className="text-ink-muted"> · повтор в {formatDateTime(target.nextAttemptAt)}</span>
              )}
            </p>
          )}
          {target.status === 'failed' && (
            <div className="pl-10">
              <Button size="sm" variant="soft" disabled={busy} onClick={() => onRetry(target.platform)}>
                <RotateCcw /> Повторить
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
