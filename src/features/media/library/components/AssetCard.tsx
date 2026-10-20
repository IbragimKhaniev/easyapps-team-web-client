import { Clapperboard } from 'lucide-react';

import type { MediaAsset } from '@/api/models';
import { formatLongDate } from '@/lib/dates';
import { AssetThumb } from '../../components/AssetThumb';
import { formatBytes } from '../../lib/format';

interface IAssetCardProps {
  asset: MediaAsset;
  onOpen: (id: string) => void;
}

/** Файл в сетке медиатеки: превью, название, размер и дата; ролик конвейера — со значком и номером. */
export const AssetCard = ({ asset, onOpen }: IAssetCardProps) => (
  <button
    type="button"
    onClick={() => onOpen(asset.id)}
    className="group flex flex-col overflow-hidden rounded-card bg-white text-left shadow-card transition-shadow hover:shadow-float"
  >
    <span className="relative block overflow-hidden">
      <AssetThumb
        kind={asset.kind}
        thumbnailUrl={asset.thumbnailUrl}
        durationSec={asset.durationSec}
        alt={asset.title}
        showKind
        className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.02]"
      />
      {asset.source && (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur" title="Ролик из конвейера">
          <Clapperboard className="h-3 w-3" /> {asset.source.video}
        </span>
      )}
    </span>
    <span className="flex flex-col gap-0.5 px-3 py-2.5">
      <span className="truncate text-[13.5px] font-bold text-ink">{asset.title}</span>
      <span className="truncate text-[12px] text-ink-muted">
        {formatBytes(asset.size)} · {formatLongDate(asset.createdAt.slice(0, 10))}
      </span>
    </span>
  </button>
);
