import { Eye, FileText, Music } from 'lucide-react';

import type { MediaAsset } from '@/api/models';
import { formatBytes } from '../../../lib/format';
import { toTelegramHtml } from '../../../lib/markup';
import { PreviewMediaGrid } from './PreviewMediaGrid';

interface ITelegramPreviewProps {
  channelTitle: string;
  text: string;
  media: MediaAsset[];
  time: string;
}

/** Пост канала так, как его увидят в Telegram: облачко с медиа, текстом и счётчиком просмотров. */
export const TelegramPreview = ({ channelTitle, text, media, time }: ITelegramPreviewProps) => {
  const visual = media.filter((asset) => asset.kind === 'image' || asset.kind === 'video');
  const files = media.filter((asset) => asset.kind === 'audio' || asset.kind === 'document');
  const html = toTelegramHtml(text.trim());

  return (
    <div className="rounded-[22px] bg-[#cfe3d2] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.25),transparent_45%)] p-4">
      <div className="mx-auto max-w-[380px]">
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#229ED9] text-[13px] font-bold text-white">
            {channelTitle.charAt(0).toUpperCase()}
          </span>
          <span className="text-[14px] font-bold text-[#1f2d1f]">{channelTitle}</span>
        </div>
        <div className="overflow-hidden rounded-[18px] rounded-bl-md bg-white shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
          {visual.length > 0 && <PreviewMediaGrid assets={visual} />}
          {files.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 px-3 pt-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4fa3e0] text-white">
                {asset.kind === 'audio' ? <Music className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-ink">{asset.fileName}</span>
                <span className="block text-[12px] text-ink-muted">{formatBytes(asset.size)}</span>
              </span>
            </div>
          ))}
          {html ? (
            <div
              className="break-words px-3 pb-1.5 pt-2 text-[15px] leading-[1.4] text-[#0f1419] [&_a]:text-[#168acd] [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-black/[0.06] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px]"
              // Текст экранирован целиком до вставки своих тегов (toTelegramHtml) — здесь безопасно.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            visual.length === 0 && files.length === 0 && <div className="px-3 pt-2 text-[15px] text-ink-faint">Текст поста</div>
          )}
          <div className="flex items-center justify-end gap-1.5 px-3 pb-2 text-[12px] text-[#8b9aa6]">
            <Eye className="h-3.5 w-3.5" /> 0 · {time}
          </div>
        </div>
      </div>
    </div>
  );
};
