import { Check, MessageSquareWarning } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { PipelineVideoStatus } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { REVIEWABLE_STATUSES, TIMELINE_LABELS, timelineSeconds, VIDEO_STATUS_META, VIDEO_STATUS_ORDER, videoStatusMeta } from '../lib/pipelineMeta';

interface IVideoSheetProps {
  number: string | null;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  onClose: () => void;
}

/**
 * Ролик: видео с вариантами подписей, хук, раскладка по секундам, решение
 * людей («Одобрить» / «Нужны правки» с комментарием — агент увидит его в
 * pipeline_brief) и статус.
 */
export const VideoSheet = ({ number, lookups, actions, onClose }: IVideoSheetProps) => {
  const video = number ? lookups.videoBy.get(number) : undefined;
  const [variant, setVariant] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    setVariant(0);
    setComment('');
  }, [number]);

  if (!video) {
    return <ResponsiveDialog open={false} onOpenChange={() => onClose()} title="Ролик"><div /></ResponsiveDialog>;
  }

  const hero = video.hero ? lookups.heroBy.get(video.hero) : undefined;
  const format = video.format ? lookups.formatBy.get(video.format) : undefined;
  const current = video.variants[Math.min(variant, Math.max(0, video.variants.length - 1))];
  const file = current?.file ?? video.file;
  const cover = current?.cover ?? video.cover;
  const total = timelineSeconds(video.timeline) || 1;
  const canReview = REVIEWABLE_STATUSES.includes(video.status as PipelineVideoStatus);
  const labelOf = (source: string) => lookups.sceneBy.get(source)?.title ?? TIMELINE_LABELS[source] ?? source;

  const decide = async (approved: boolean) => {
    if (!approved && !comment.trim()) {
      toast.error('Напишите, что поправить: хук, темп, кадр, текст…');
      return;
    }
    const done = approved ? await actions.approve(video.number, comment.trim()) : await actions.requestChanges(video.number, comment.trim());
    if (done) setComment('');
  };

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`${video.number}: ${format?.title ?? video.format ?? 'ролик'}`}
      showTitle
      desktopClassName="max-h-[min(94vh,960px)] max-w-[760px] overflow-y-auto"
      mobileClassName="h-[94dvh]"
    >
      <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-6 pt-2 lg:px-6">
        <div className="-mt-1 flex flex-wrap items-center gap-2 text-[14px] text-ink-muted">
          <span>{hero?.name ?? 'Без актёров'}</span>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[12.5px] font-bold', videoStatusMeta(video.status).pill)}>{videoStatusMeta(video.status).label}</span>
          {video.seconds ? <span>{Math.round(video.seconds)} с</span> : null}
          <span className="text-[12.5px] text-ink-faint">· {formatDateTime(video.updatedAt)}{video.updatedVia && video.updatedVia !== 'web' ? ` · агент ${video.updatedVia}` : ''}</span>
        </div>

        {file ? (
          <video key={file} src={file} poster={cover ?? undefined} controls playsInline preload="metadata" className="mx-auto max-h-[60vh] w-auto max-w-full rounded-2xl bg-black" />
        ) : (
          <p className="rounded-2xl bg-panel p-4 text-[14px] text-ink-muted">Ролик ещё не собран. Когда агент зальёт сборку, видео появится здесь.</p>
        )}

        {video.variants.length > 1 && current && (
          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Подписи</b>
            <div className="flex flex-wrap gap-2">
              {video.variants.map((item, index) => (
                <Button key={item.name} type="button" size="sm" variant={index === variant ? 'primary' : 'soft'} onClick={() => setVariant(index)}>
                  {item.title}
                </Button>
              ))}
            </div>
            {current.captions.length > 0 && <p className="text-[13px] text-ink-muted">{current.captions.join(' · ')}</p>}
          </section>
        )}

        <section className="flex flex-col gap-1.5">
          <b className="text-[15px] text-ink">Хук</b>
          <p className="text-[17px] font-semibold leading-snug text-ink">{video.hook || '—'}</p>
          {video.altHooks.length > 0 && (
            <ul className="list-disc pl-5 text-[14px] text-ink-soft">{video.altHooks.map((hook) => <li key={hook}>{hook}</li>)}</ul>
          )}
          {video.idea && <p className="text-[13.5px] text-ink-muted">{video.idea}</p>}
        </section>

        {video.timeline.length > 0 && (
          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Раскладка</b>
            <div className="flex h-14 overflow-hidden rounded-2xl">
              {video.timeline.map(([source, seconds, note], index) => (
                <div
                  key={`${String(source)}-${index}`}
                  title={String(note ?? '')}
                  className={cn('flex min-w-0 flex-col justify-center border-r border-white px-2 text-[11px]', String(source) === 'magic' ? 'bg-brand-100 text-brand-900' : 'bg-secondary text-ink-soft')}
                  style={{ flex: Number(seconds) || 1 }}
                >
                  <b className="truncate">{labelOf(String(source))}</b>
                  <span>{String(seconds)} с</span>
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-faint">Всего около {Math.round(total)} с.{format?.idea ? ` ${format.idea}` : ''}</p>
          </section>
        )}

        {video.review?.comment && (
          <section className="flex items-start gap-2 rounded-2xl bg-rose-50/60 p-3 text-[14px] text-ink-soft">
            <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span><b>Последний комментарий: </b>{video.review.comment}</span>
          </section>
        )}

        {canReview ? (
          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Решение</b>
            <Textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Что поправить: хук, темп, кадр, текст… (для одобрения — по желанию)" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={actions.busy} onClick={() => decide(true)}><Check /> Одобрить</Button>
              <Button type="button" variant="outline" disabled={actions.busy} onClick={() => decide(false)}>Нужны правки</Button>
            </div>
          </section>
        ) : (
          <p className="text-[13px] text-ink-faint">Решение — когда ролик соберут и поставят на проверку.</p>
        )}

        <section className="flex flex-col gap-2">
          <b className="text-[15px] text-ink">Статус</b>
          <div className="flex flex-wrap gap-1.5">
            {VIDEO_STATUS_ORDER.map((status) => (
              <button
                key={status}
                type="button"
                disabled={actions.busy || status === video.status}
                onClick={() => actions.setVideoStatus(video.number, status)}
                className={cn('h-8 rounded-full px-3 text-[12.5px] font-bold transition', status === video.status ? VIDEO_STATUS_META[status].pill : 'bg-secondary text-ink-muted hover:bg-ink/[0.08]')}
              >
                {VIDEO_STATUS_META[status].label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </ResponsiveDialog>
  );
};
