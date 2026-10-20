import type { PipelineVideo } from '@/api/models';
import { cn } from '@/lib/utils';
import type { IPipelineLookups } from '../hooks/usePipelineData';

interface IVideoCardProps {
  video: PipelineVideo;
  lookups: IPipelineLookups;
  onOpen: () => void;
  className?: string;
}

/** Ролик на доске: номер, формат, хук, герой и отметки (правки, одобрен, проверка не прошла). */
export const VideoCard = ({ video, lookups, onOpen, className }: IVideoCardProps) => {
  const hero = video.hero ? lookups.heroBy.get(video.hero) : undefined;
  const format = video.format ? lookups.formatBy.get(video.format) : undefined;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn('flex w-full flex-col gap-1.5 rounded-2xl border-l-4 bg-white p-3 text-left shadow-card transition hover:shadow-lift', className)}
      style={{ borderLeftColor: hero?.data.color ?? '#9CA3AF' }}
    >
      <div className="flex items-center justify-between gap-2 text-[12px]">
        <b className="font-mono text-ink">{video.number}</b>
        <span className="truncate text-ink-faint">{format?.title ?? video.format ?? ''}</span>
      </div>
      <p className="line-clamp-3 text-[14px] font-semibold leading-snug text-ink">{video.hook || video.idea || 'Без хука'}</p>
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
        <span>{hero?.name ?? 'без актёров'}{format?.seconds ? `, ${format.seconds} с` : ''}</span>
        {video.status === 'changes' && video.review?.comment && <span className="rounded-full bg-rose-50 px-2 font-bold text-rose-700">Правки</span>}
        {video.qaFailed && <span className="rounded-full bg-amber-50 px-2 font-bold text-amber-800">Проверка не прошла</span>}
        {video.status === 'approved' && <span className="rounded-full bg-emerald-50 px-2 font-bold text-emerald-700">Одобрен</span>}
      </div>
    </button>
  );
};
