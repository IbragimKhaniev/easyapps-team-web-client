import { FileText, Film, Image as ImageIcon, Music } from 'lucide-react';

import type { MediaKind } from '@/api/models';
import { cn } from '@/lib/utils';
import { formatDuration } from '../lib/format';

const KIND_ICONS = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
} as const;

interface IAssetThumbProps {
  kind: MediaKind;
  thumbnailUrl: string | null;
  durationSec?: number | null;
  alt?: string;
  className?: string;
  /** Подпись вида поверх превью (в медиатеке — да, в ленте поста — нет). */
  showKind?: boolean;
}

/** Превью файла: картинка или значок вида, у видео и аудио — длительность. */
export const AssetThumb = ({ kind, thumbnailUrl, durationSec, alt = '', className, showKind = false }: IAssetThumbProps) => {
  const Icon = KIND_ICONS[kind];
  return (
    <div className={cn('relative overflow-hidden bg-secondary', className)}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-faint">
          <Icon className="h-1/3 max-h-10 w-1/3 max-w-10" />
        </div>
      )}
      {(durationSec || (showKind && kind !== 'image')) && (
        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10.5px] font-bold text-white backdrop-blur tabular">
          {kind !== 'image' && <Icon className="h-3 w-3" />}
          {durationSec ? formatDuration(durationSec) : null}
        </span>
      )}
    </div>
  );
};
