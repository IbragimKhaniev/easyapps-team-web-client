import { Check, Search, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useListMediaAssets } from '@/api/generated/media-assets/media-assets';
import type { MediaAsset, MediaKind } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { AssetThumb } from '../../components/AssetThumb';
import { uploadQueue, useUploadItems } from '../../hooks/uploadQueue';

/** `pipeline` — собранные ролики конвейера (они в медиатеке без копии). */
type TKindFilter = 'all' | MediaKind | 'pipeline';

const KIND_SEGMENTS: Array<{ value: TKindFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'image', label: 'Фото' },
  { value: 'video', label: 'Видео' },
  { value: 'pipeline', label: 'Конвейер' },
  { value: 'document', label: 'Файлы' },
];

const PICKER_PAGE = 120;
const SEARCH_DEBOUNCE_MS = 250;

interface IMediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Уже в посте — отмечены и не выбираются второй раз. */
  selectedIds: string[];
  /** Сколько ещё можно добавить. */
  limit: number;
  onPick: (assets: MediaAsset[]) => void;
}

/** Выбор файлов поста из медиатеки; загруженный здесь файл сразу отмечен. */
export const MediaPickerDialog = ({ open, onOpenChange, selectedIds, limit, onPick }: IMediaPickerDialogProps) => {
  const [kind, setKind] = useState<TKindFilter>('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<MediaAsset[]>([]);
  const [uploadIds, setUploadIds] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const uploads = useUploadItems();

  useEffect(() => {
    if (!open) {
      setPicked([]);
      setUploadIds([]);
    }
  }, [open]);

  const { data, isLoading } = useListMediaAssets(
    {
      kind: kind === 'all' || kind === 'pipeline' ? undefined : kind,
      source: kind === 'pipeline' ? 'pipeline' : undefined,
      q: debounced || undefined,
      sort: 'newest',
      limit: PICKER_PAGE,
    },
    { query: { enabled: open } },
  );
  const assets = data?.data ?? [];
  const pickedIds = useMemo(() => new Set(picked.map((asset) => asset.id)), [picked]);
  const activeUploads = uploads.filter((item) => uploadIds.includes(item.id) && item.status !== 'done');

  const toggle = (asset: MediaAsset) => {
    if (selectedIds.includes(asset.id)) return;
    setPicked((current) => {
      if (current.some((item) => item.id === asset.id)) return current.filter((item) => item.id !== asset.id);
      if (current.length >= limit) return current;
      return [...current, asset];
    });
  };

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const ids = uploadQueue.add([...files], {
      onUploaded: (asset) => setPicked((current) => (current.length < limit ? [...current, asset] : current)),
    });
    setUploadIds((current) => [...current, ...ids]);
  };

  const confirm = () => {
    onPick(picked);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Файлы из медиатеки"
      showTitle
      desktopClassName="h-[min(86vh,760px)] max-w-3xl"
      mobileClassName="h-[90dvh]"
    >
      <div className="flex flex-col gap-3 px-5 pt-3 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию" className="pl-9" />
          </div>
          <Button variant="soft" onClick={() => fileInput.current?.click()}>
            <Upload /> Загрузить
          </Button>
          <input ref={fileInput} type="file" multiple hidden onChange={(event) => { upload(event.target.files); event.target.value = ''; }} />
        </div>
        <SegmentedControl segments={KIND_SEGMENTS} value={kind} onChange={setKind} size="sm" className="self-start" />
        {activeUploads.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate font-semibold text-ink">{item.fileName}</span>
            {item.status === 'error'
              ? <span className="text-rose-600">{item.error}</span>
              : <Progress value={item.progress * 100} className="h-1.5 w-28" />}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 lg:px-6">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => <div key={index} className="skeleton aspect-square rounded-2xl" />)}
          </div>
        ) : assets.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {assets.map((asset) => {
              const inPost = selectedIds.includes(asset.id);
              const isPicked = pickedIds.has(asset.id);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => toggle(asset)}
                  disabled={inPost}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-2xl text-left ring-offset-2 transition-shadow',
                    isPicked && 'ring-[3px] ring-brand-500',
                    inPost && 'opacity-45',
                  )}
                  title={asset.title}
                >
                  <AssetThumb kind={asset.kind} thumbnailUrl={asset.thumbnailUrl} durationSec={asset.durationSec} showKind className="h-full w-full" />
                  <span
                    className={cn(
                      'absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-card transition-colors',
                      isPicked || inPost ? 'bg-brand-600 text-white' : 'bg-black/25 text-transparent group-hover:bg-black/40',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-5 text-[11px] font-semibold text-white">
                    {asset.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-ink-muted">
            {kind === 'pipeline' ? 'Собранных роликов конвейера пока нет — они появятся здесь сами.' : 'Здесь пока пусто — загрузите файл кнопкой выше.'}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-3 lg:px-6">
        <span className="text-[13px] text-ink-muted">
          {limit > 0 ? `Можно добавить ещё ${limit}` : 'В посте уже максимум файлов'}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={confirm} disabled={!picked.length}>
            Добавить{picked.length ? ` (${picked.length})` : ''}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
