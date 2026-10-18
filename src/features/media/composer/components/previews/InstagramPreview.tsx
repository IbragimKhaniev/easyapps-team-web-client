import { Bookmark, Heart, MessageCircle, MoreHorizontal, Play, Send } from 'lucide-react';

import type { InstagramPostType, MediaAsset } from '@/api/models';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../../components/AssetThumb';
import { highlightTags, toPlainText } from '../../../lib/markup';

interface IInstagramPreviewProps {
  handle: string;
  text: string;
  media: MediaAsset[];
  type: InstagramPostType;
}

const Caption = ({ handle, text }: { handle: string; text: string }) => (
  <p className="whitespace-pre-line break-words text-[14px] leading-[1.4] text-[#0f1419]">
    <span className="font-bold">{handle} </span>
    {highlightTags(toPlainText(text.trim())).map((part, index) =>
      part.tag ? <span key={index} className="text-[#00376b]">{part.text}</span> : <span key={index}>{part.text}</span>,
    )}
  </p>
);

const Avatar = () => (
  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[conic-gradient(from_210deg,#f9ce34,#ee2a7b,#6228d7,#f9ce34)] p-[2px]">
    <span className="h-full w-full rounded-full border-2 border-white bg-brand-500" />
  </span>
);

/** Публикация Instagram: пост ленты (с каруселью), рилс 9:16 или история — как в приложении. */
export const InstagramPreview = ({ handle, text, media, type }: IInstagramPreviewProps) => {
  const first = media[0];
  const name = handle.replace(/^@/, '') || 'easyapps';

  if (type === 'story' || type === 'reel') {
    return (
      <div className="mx-auto w-full max-w-[300px]">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[22px] bg-ink">
          {first ? (
            <AssetThumb kind={first.kind} thumbnailUrl={first.thumbnailUrl} className="h-full w-full opacity-95" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/60">Нужно видео или фото</div>
          )}
          {type === 'story' && (
            <>
              <div className="absolute inset-x-3 top-3 h-[3px] rounded-full bg-white/40">
                <div className="h-full w-1/3 rounded-full bg-white" />
              </div>
              <div className="absolute left-3 top-6 flex items-center gap-2 text-[13px] font-semibold text-white drop-shadow">
                <Avatar /> {name}
              </div>
            </>
          )}
          {type === 'reel' && (
            <>
              <span className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur">
                <Play className="ml-1 h-7 w-7" fill="currentColor" />
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-12 text-white">
                <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold"><Avatar /> {name}</div>
                <p className="line-clamp-2 text-[13px] leading-snug">{toPlainText(text.trim()) || 'Подпись к рилсу'}</p>
              </div>
            </>
          )}
        </div>
        {type === 'story' && text.trim() && <p className="mt-2 text-center text-[12px] text-amber-700">У истории нет подписи — текст не выйдет</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[22px] border border-black/[0.08] bg-white">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Avatar />
        <span className="flex-1 text-[14px] font-bold text-ink">{name}</span>
        <MoreHorizontal className="h-5 w-5 text-ink" />
      </div>
      <div className="relative aspect-[4/5] bg-secondary">
        {first ? (
          <AssetThumb kind={first.kind} thumbnailUrl={first.thumbnailUrl} className="h-full w-full" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink-muted">Instagram не публикует текст без фото или видео</div>
        )}
        {media.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[12px] font-semibold text-white">1/{media.length}</span>
        )}
      </div>
      <div className="flex items-center gap-4 px-3 pt-2.5 text-ink">
        <Heart className="h-6 w-6" />
        <MessageCircle className="h-6 w-6" />
        <Send className="h-6 w-6" />
        <span className="flex flex-1 justify-center gap-1">
          {media.length > 1 && media.slice(0, 6).map((asset, index) => (
            <span key={asset.id} className={cn('h-1.5 w-1.5 rounded-full', index === 0 ? 'bg-[#0095f6]' : 'bg-black/20')} />
          ))}
        </span>
        <Bookmark className="h-6 w-6" />
      </div>
      <div className="px-3 pb-3 pt-2">
        <Caption handle={name} text={text} />
      </div>
    </div>
  );
};
