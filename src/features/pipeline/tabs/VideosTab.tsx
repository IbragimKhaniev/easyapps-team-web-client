import type { PipelineState } from '@/api/models';
import { cn } from '@/lib/utils';
import { VideoCard } from '../components/VideoCard';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { VIDEO_STATUS_META, VIDEO_STATUS_ORDER } from '../lib/pipelineMeta';

interface IVideosTabProps {
  state: PipelineState;
  lookups: IPipelineLookups;
  onOpenVideo: (number: string) => void;
}

/** Ролики по пути от идеи до публикации. На проверке — открыть, посмотреть и решить. */
export const VideosTab = ({ state, lookups, onOpenVideo }: IVideosTabProps) => (
  <div className="flex flex-col gap-4">
    <p className="text-[14px] text-ink-muted">
      Когда ролик на проверке, откройте его: посмотрите и одобрите или напишите, что поправить, — агент увидит решение и комментарий.
    </p>
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {VIDEO_STATUS_ORDER.map((status) => {
        const list = state.videos.filter((video) => video.status === status);
        return (
          <section key={status} aria-label={VIDEO_STATUS_META[status].label} className={cn('flex w-[260px] shrink-0 flex-col gap-2 rounded-card bg-panel p-2.5', status === 'review' && list.length && 'ring-1 ring-amber-200')}>
            <header className="flex items-center justify-between px-1.5 pt-1">
              <span className={cn('rounded-full px-2.5 py-0.5 text-[12.5px] font-bold', VIDEO_STATUS_META[status].pill)}>{VIDEO_STATUS_META[status].label}</span>
              <span className="font-mono text-[12.5px] text-ink-faint">{list.length}</span>
            </header>
            {list.length
              ? list.map((video) => <VideoCard key={video.number} video={video} lookups={lookups} onOpen={() => onOpenVideo(video.number)} />)
              : <p className="px-1.5 pb-2 text-[13px] text-ink-faint">Пусто</p>}
          </section>
        );
      })}
    </div>
  </div>
);
