import type { ContentTypeStat } from '@/api/models';
import { Card } from '@/components/common/Card';
import { CONTENT_TYPE_LABELS, formatCompact, formatPercent } from '../../lib/format';

/** Что заходит лучше: виды постов со средними просмотрами и вовлечённостью. */
export const ContentTypesCard = ({ stats }: { stats: ContentTypeStat[] }) => {
  const maxViews = Math.max(1, ...stats.map((stat) => stat.avgViews ?? 0));
  return (
    <Card title="Что заходит лучше" className="h-full">
      {stats.length ? (
        <div className="flex flex-col gap-3.5">
          {stats.map((stat) => (
            <div key={stat.contentType} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-[13.5px]">
                <span className="font-bold text-ink">{CONTENT_TYPE_LABELS[stat.contentType]}</span>
                <span className="text-ink-muted tabular">
                  {stat.posts} шт · ≈{formatCompact(stat.avgViews)} просм. · ER {formatPercent(stat.avgEngagementRate)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-400" style={{ width: `${Math.max(4, ((stat.avgViews ?? 0) / maxViews) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-ink-muted">За период постов не было.</p>
      )}
    </Card>
  );
};
