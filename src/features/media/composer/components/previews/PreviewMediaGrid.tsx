import type { MediaAsset } from '@/api/models';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../../components/AssetThumb';

interface IPreviewMediaGridProps {
  assets: MediaAsset[];
  className?: string;
  /** Скругление внутренних ячеек — у каждой площадки своё. */
  cellClassName?: string;
}

/** Больше стольких ячеек раскладка не показывает — последняя получает «+N». */
const MAX_CELLS = 5;

/**
 * Раскладка альбома как в клиентах площадок: один файл — во всю ширину,
 * два — пополам, три — крупный и два, четыре — сеткой 2×2, больше — 2+3 с «+N».
 */
export const PreviewMediaGrid = ({ assets, className, cellClassName }: IPreviewMediaGridProps) => {
  if (!assets.length) return null;
  const shown = assets.slice(0, MAX_CELLS);
  const extra = assets.length - shown.length;

  const cell = (asset: MediaAsset, index: number, classes: string) => (
    <div key={asset.id} className={cn('relative overflow-hidden', cellClassName, classes)}>
      <AssetThumb kind={asset.kind} thumbnailUrl={asset.thumbnailUrl} durationSec={asset.durationSec} className="h-full w-full" />
      {extra > 0 && index === shown.length - 1 && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-bold text-white">+{extra}</span>
      )}
    </div>
  );

  if (shown.length === 1) {
    const [asset] = shown;
    const ratio = asset.width && asset.height ? Math.min(Math.max(asset.width / asset.height, 0.66), 1.9) : 1.25;
    return (
      <div className={cn('overflow-hidden', className)} style={{ aspectRatio: String(ratio) }}>
        {cell(asset, 0, 'h-full w-full')}
      </div>
    );
  }

  if (shown.length === 2) {
    return <div className={cn('grid aspect-[2/1] grid-cols-2 gap-0.5', className)}>{shown.map((asset, index) => cell(asset, index, 'h-full'))}</div>;
  }

  if (shown.length === 3) {
    return (
      <div className={cn('grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-0.5', className)}>
        {cell(shown[0], 0, 'col-span-2 row-span-2')}
        {cell(shown[1], 1, '')}
        {cell(shown[2], 2, '')}
      </div>
    );
  }

  if (shown.length === 4) {
    return <div className={cn('grid aspect-square grid-cols-2 grid-rows-2 gap-0.5', className)}>{shown.map((asset, index) => cell(asset, index, ''))}</div>;
  }

  return (
    <div className={cn('grid aspect-[6/5] grid-cols-6 grid-rows-2 gap-0.5', className)}>
      {shown.map((asset, index) => cell(asset, index, index < 2 ? 'col-span-3' : 'col-span-2'))}
    </div>
  );
};
