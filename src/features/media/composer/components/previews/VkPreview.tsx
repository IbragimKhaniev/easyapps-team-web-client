import { Eye, FileText, Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';

import type { MediaAsset } from '@/api/models';
import { formatBytes } from '../../../lib/format';
import { highlightTags, toPlainText } from '../../../lib/markup';
import { PreviewMediaGrid } from './PreviewMediaGrid';

interface IVkPreviewProps {
  communityTitle: string;
  text: string;
  media: MediaAsset[];
}

/** Запись на стене сообщества VK: текст сверху, вложения сеткой, счётчики снизу. */
export const VkPreview = ({ communityTitle, text, media }: IVkPreviewProps) => {
  const visual = media.filter((asset) => asset.kind === 'image' || asset.kind === 'video');
  const files = media.filter((asset) => asset.kind === 'document');
  const plain = toPlainText(text.trim());

  return (
    <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[18px] border border-black/[0.08] bg-white">
      <div className="flex items-center gap-2.5 px-4 pt-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0077FF] text-[15px] font-bold text-white">
          {communityTitle.charAt(0).toUpperCase()}
        </span>
        <span className="flex-1">
          <span className="block text-[14px] font-semibold text-[#2a5885]">{communityTitle}</span>
          <span className="block text-[12.5px] text-[#818c99]">только что</span>
        </span>
        <MoreHorizontal className="h-5 w-5 text-[#818c99]" />
      </div>
      {plain ? (
        <p className="whitespace-pre-line break-words px-4 pt-2.5 text-[14.5px] leading-[1.45] text-black">
          {highlightTags(plain).map((part, index) =>
            part.tag ? <span key={index} className="text-[#2a5885]">{part.text}</span> : <span key={index}>{part.text}</span>,
          )}
        </p>
      ) : null}
      {visual.length > 0 && <PreviewMediaGrid assets={visual} className="mt-2.5" />}
      {files.map((asset) => (
        <div key={asset.id} className="mx-4 mt-2.5 flex items-center gap-3 rounded-xl bg-[#f0f2f5] px-3 py-2">
          <FileText className="h-5 w-5 text-[#2a5885]" />
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-black">{asset.fileName}</span>
          <span className="text-[12px] text-[#818c99]">{formatBytes(asset.size)}</span>
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 px-3 pb-3 pt-1 text-[13px] font-medium text-[#818c99]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3 py-1.5"><Heart className="h-4 w-4" /> 0</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3 py-1.5"><MessageCircle className="h-4 w-4" /> 0</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3 py-1.5"><Share2 className="h-4 w-4" /> 0</span>
        <span className="ml-auto inline-flex items-center gap-1"><Eye className="h-4 w-4" /> 0</span>
      </div>
    </div>
  );
};
