import { differenceInMinutes, parseISO } from 'date-fns';
import { ArrowRight, CalendarClock, CircleAlert, Lightbulb, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useGetMediaSummary } from '@/api/generated/media-posts/media-posts';
import { PATHS, postHref } from '@/app/paths';
import { formatDateTime } from '@/lib/dates';
import { AssetThumb } from '@/features/media/components/AssetThumb';
import { PlatformIcon } from '@/features/media/components/PlatformIcon';

const SUMMARY_REFRESH_MS = 60_000;

/** «через 2 ч 15 мин», «через 3 дн.», «вот-вот». */
const countdown = (publishAt: string): string => {
  const minutes = differenceInMinutes(parseISO(publishAt), new Date());
  if (minutes < 2) return 'вот-вот';
  if (minutes < 60) return `через ${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `через ${hours} ч${minutes % 60 ? ` ${minutes % 60} мин` : ''}`;
  return `через ${Math.round(hours / 24)} дн.`;
};

/**
 * Медиа на сводке — тёмная плитка как «Time Tracker» референса: ближайшая
 * публикация с обратным отсчётом и счётчики плана.
 */
export const MediaPulseCard = () => {
  const { data } = useGetMediaSummary({ query: { refetchInterval: SUMMARY_REFRESH_MS } });
  const summary = data?.data;
  if (!summary) return <div className="skeleton h-[200px] rounded-card" />;
  const next = summary.next;

  return (
    <section className="tile-deep flex min-h-[200px] flex-col gap-5 rounded-card p-5 lg:flex-row lg:items-stretch">
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div className="flex items-center gap-2 text-[17px] font-bold">
          <CalendarClock className="h-5 w-5" /> Ближайшая публикация
        </div>
        {next?.publishAt ? (
          <Link to={postHref(next.id)} className="group flex items-center gap-4">
            {next.cover && <AssetThumb kind={next.cover.kind} thumbnailUrl={next.cover.thumbnailUrl} className="h-16 w-16 shrink-0 rounded-2xl ring-2 ring-white/20" />}
            <span className="min-w-0">
              <span className="block text-[34px] font-extrabold leading-none tracking-tight">{countdown(next.publishAt)}</span>
              <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[14px] text-white/80">
                <span className="truncate font-semibold text-white">{next.title}</span>
                <span>· {formatDateTime(next.publishAt)}</span>
                <span className="flex gap-1">
                  {next.targets.filter((target) => target.enabled).map((target) => (
                    <PlatformIcon key={target.platform} platform={target.platform} size="xs" />
                  ))}
                </span>
              </span>
            </span>
          </Link>
        ) : (
          <div>
            <div className="text-[28px] font-extrabold leading-tight tracking-tight">Ничего не запланировано</div>
            <div className="mt-1 text-[14px] text-white/75">Соберите пост в контент-плане — он выйдет сам.</div>
          </div>
        )}
        <Link
          to={PATHS.media.plan}
          className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-[14px] font-bold text-brand-950 transition-transform active:scale-95"
        >
          Контент-план <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:w-[300px] lg:grid-cols-1">
        <Link to={PATHS.media.plan} className="rounded-2xl bg-white/10 px-3.5 py-3 transition-colors hover:bg-white/15">
          <CalendarClock className="h-4 w-4 text-white/70" />
          <div className="mt-1 text-[22px] font-extrabold tabular">{summary.scheduledCount}</div>
          <div className="text-[12px] text-white/70">запланировано</div>
        </Link>
        <Link to={PATHS.media.feed} className="rounded-2xl bg-white/10 px-3.5 py-3 transition-colors hover:bg-white/15">
          <Send className="h-4 w-4 text-white/70" />
          <div className="mt-1 text-[22px] font-extrabold tabular">{summary.publishedLast7Days}</div>
          <div className="text-[12px] text-white/70">вышло за неделю</div>
        </Link>
        {summary.failedCount > 0 ? (
          <Link to={PATHS.media.plan} className="rounded-2xl bg-rose-500/25 px-3.5 py-3 transition-colors hover:bg-rose-500/35">
            <CircleAlert className="h-4 w-4 text-rose-200" />
            <div className="mt-1 text-[22px] font-extrabold tabular">{summary.failedCount}</div>
            <div className="text-[12px] text-rose-100">с ошибкой</div>
          </Link>
        ) : (
          <Link to={PATHS.media.plan} className="rounded-2xl bg-white/10 px-3.5 py-3 transition-colors hover:bg-white/15">
            <Lightbulb className="h-4 w-4 text-white/70" />
            <div className="mt-1 text-[22px] font-extrabold tabular">{summary.ideasCount}</div>
            <div className="text-[12px] text-white/70">идей в плане</div>
          </Link>
        )}
      </div>
    </section>
  );
};
