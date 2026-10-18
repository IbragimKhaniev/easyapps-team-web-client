import { CalendarCheck, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useGetSocialPost } from '@/api/generated/media-feed/media-feed';
import type { SocialMetrics, SocialPostDetail } from '@/api/models';
import { postHref } from '@/app/paths';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { formatDateTime, timeAgo } from '@/lib/dates';
import { AssetThumb } from '../../components/AssetThumb';
import { PlatformIcon } from '../../components/PlatformIcon';
import { AXIS_TICK, CHART_COLORS, GRID_PROPS, TOOLTIP_STYLE, valueTick } from '../../lib/chartTheme';
import { CONTENT_TYPE_LABELS, formatNumber, formatPercent } from '../../lib/format';
import { PLATFORM_META } from '../../lib/platforms';

interface ISocialPostSheetProps {
  postId: string | null;
  onClose: () => void;
}

const METRIC_LABELS: Array<{ key: keyof SocialMetrics; label: string }> = [
  { key: 'views', label: 'Просмотры' },
  { key: 'reach', label: 'Охват' },
  { key: 'likes', label: 'Лайки' },
  { key: 'reactions', label: 'Реакции' },
  { key: 'comments', label: 'Комментарии' },
  { key: 'shares', label: 'Репосты и пересылки' },
  { key: 'saves', label: 'Сохранения' },
  { key: 'plays', label: 'Воспроизведения' },
];

/** Главная метрика графика: просмотры, если площадка их считает, иначе охват, иначе лайки. */
const mainMetricOf = (post: SocialPostDetail): { key: keyof SocialMetrics; label: string } =>
  (['views', 'reach', 'likes', 'reactions'] as const)
    .map((key) => ({ key, label: METRIC_LABELS.find((item) => item.key === key)!.label }))
    .find(({ key }) => post.metrics[key] !== null) ?? { key: 'views', label: 'Просмотры' };

const HistoryChart = ({ post }: { post: SocialPostDetail }) => {
  const metric = mainMetricOf(post);
  const points = post.history.map((point) => ({ at: point.at, value: point.metrics[metric.key] ?? null }));
  if (points.length < 2) {
    return <p className="rounded-2xl bg-secondary px-4 py-6 text-center text-[13px] text-ink-muted">График появится после нескольких обходов сборщика.</p>;
  }
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="history-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[post.platform]} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS[post.platform]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="at" tickFormatter={(value: string) => formatDateTime(value).split(',')[0]} tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tickFormatter={valueTick} tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
          <Tooltip {...TOOLTIP_STYLE} labelFormatter={(value: string) => formatDateTime(value)} formatter={(value: number) => [formatNumber(value), metric.label]} />
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS[post.platform]} strokeWidth={2.5} fill="url(#history-fill)" connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Пост площадки целиком: текст, все метрики, как набирал просмотры, ссылка на площадку и пост плана. */
export const SocialPostSheet = ({ postId, onClose }: ISocialPostSheetProps) => {
  const { data, isLoading } = useGetSocialPost(postId ?? '', { query: { enabled: Boolean(postId) } });
  const post = data?.data;

  return (
    <ResponsiveDialog
      open={Boolean(postId)}
      onOpenChange={(open) => !open && onClose()}
      title="Пост площадки"
      desktopClassName="h-[min(90vh,820px)] max-w-[760px] overflow-hidden"
      mobileClassName="h-[92dvh]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-3 lg:px-6">
        {post ? (
          <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <PlatformIcon platform={post.platform} size="sm" /> {PLATFORM_META[post.platform].title} · {CONTENT_TYPE_LABELS[post.contentType]}
          </span>
        ) : <span />}
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Закрыть">
          <X />
        </Button>
      </div>
      {isLoading || !post ? (
        <div className="flex flex-col gap-4 p-6">
          <div className="skeleton h-40 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 lg:px-6">
          <div className="flex gap-4">
            {post.previewUrl && <AssetThumb kind="image" thumbnailUrl={post.previewUrl} className="h-32 w-32 shrink-0 rounded-2xl" />}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-ink-muted">{formatDateTime(post.publishedAt)} · метрики {post.metricsUpdatedAt ? timeAgo(post.metricsUpdatedAt) : 'ещё не собраны'}</div>
              <p className="mt-1.5 whitespace-pre-line break-words text-[14.5px] leading-relaxed text-ink">{post.text || 'Без текста'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METRIC_LABELS.filter(({ key }) => post.metrics[key] !== null).map(({ key, label }) => (
              <div key={key} className="rounded-2xl bg-secondary px-3.5 py-3">
                <div className="text-[12px] font-semibold text-ink-muted">{label}</div>
                <div className="mt-1 text-[22px] font-extrabold tracking-tight text-ink tabular">{formatNumber(post.metrics[key])}</div>
              </div>
            ))}
            <div className="rounded-2xl bg-emerald-50 px-3.5 py-3">
              <div className="text-[12px] font-semibold text-emerald-700">Вовлечённость</div>
              <div className="mt-1 text-[22px] font-extrabold tracking-tight text-emerald-800 tabular">{formatPercent(post.engagementRate)}</div>
            </div>
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Как набирал — {mainMetricOf(post).label.toLowerCase()}</h3>
            <HistoryChart post={post} />
          </section>

          <div className="flex flex-wrap gap-2">
            {post.url && (
              <Button variant="soft" asChild>
                <a href={post.url} target="_blank" rel="noreferrer">
                  Открыть на площадке <ExternalLink />
                </a>
              </Button>
            )}
            {post.teamPost && (
              <Button variant="ghost" asChild>
                <Link to={postHref(post.teamPost.id)} onClick={onClose}>
                  <CalendarCheck /> В плане: {post.teamPost.title}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
};
