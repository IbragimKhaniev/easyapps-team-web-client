import { AnimatePresence, motion } from 'framer-motion';
import { HardDrive, Images, Upload, UploadCloud } from 'lucide-react';
import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useGetMediaStorageStatus, useListMediaAssetTags } from '@/api/generated/media-assets/media-assets';
import { PATHS } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { FILE_FORMS, pluralize } from '@/lib/plural';
import { MediaSectionTabs } from '../components/MediaSectionTabs';
import { uploadQueue } from '../hooks/uploadQueue';
import { formatBytes } from '../lib/format';
import { AssetCard } from './components/AssetCard';
import { AssetDetailSheet } from './components/AssetDetailSheet';
import { LibraryFilters } from './components/LibraryFilters';
import { useLibraryAssets } from './hooks/useLibraryAssets';
import { useLibraryFilters } from './hooks/useLibraryFilters';
import { useWindowFileDrop } from './hooks/useWindowFileDrop';

const ASSET_PARAM = 'asset';

const GridSkeleton = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
    {Array.from({ length: 12 }, (_, index) => <div key={index} className="skeleton aspect-[4/5] rounded-card" />)}
  </div>
);

/**
 * Медиатека: все фото, видео и файлы для постов — в личном S3. Фильтры по
 * виду и меткам, поиск, сортировка; файл можно бросить прямо на окно.
 */
export const MediaLibraryPage = () => {
  const isDesktop = useIsDesktop();
  const filters = useLibraryFilters();
  const [params, setParams] = useSearchParams();
  const fileInput = useRef<HTMLInputElement>(null);
  const { data: storageData } = useGetMediaStorageStatus();
  const { data: tagsData } = useListMediaAssetTags();
  const storage = storageData?.data;

  const assets = useLibraryAssets({
    kind: filters.kind === 'all' ? undefined : filters.kind,
    tag: filters.tag ?? undefined,
    q: filters.query || undefined,
    uploadedBy: filters.mine ? 'me' : undefined,
    sort: filters.sort,
  });
  const items = assets.data?.pages.flatMap((page) => page.data) ?? [];
  const total = assets.data?.pages[0]?.pagination.totalItems ?? 0;

  const upload = (files: File[]) => uploadQueue.add(files, { tags: filters.tag ? [filters.tag] : [] });
  const dragging = useWindowFileDrop(upload);

  const openAsset = (id: string) => setParams((current) => {
    const next = new URLSearchParams(current);
    next.set(ASSET_PARAM, id);
    return next;
  });
  const closeAsset = () => setParams((current) => {
    const next = new URLSearchParams(current);
    next.delete(ASSET_PARAM);
    return next;
  }, { replace: true });

  const subtitle = storage?.configured
    ? `${pluralize(storage.assetsCount, FILE_FORMS)} · ${formatBytes(storage.totalBytes)}${storage.ok ? '' : ' · хранилище не отвечает'}`
    : undefined;

  const uploadButton = (
    <Button size={isDesktop ? 'lg' : 'icon'} onClick={() => fileInput.current?.click()} disabled={storage?.configured === false} aria-label="Загрузить">
      <Upload /> {isDesktop && 'Загрузить'}
    </Button>
  );

  const body = storage?.configured === false ? (
    <div className="card-surface">
      <EmptyState
        icon={HardDrive}
        title="Хранилище не подключено"
        description="Файлы медиатеки живут в личном S3. Задайте секреты MEDIA_S3_* сервиса team-api — после выкладки здесь можно будет загружать фото и видео."
        action={<Button variant="soft" asChild><Link to={PATHS.media.settings}>Площадки и хранилище</Link></Button>}
      />
    </div>
  ) : assets.isLoading ? (
    <GridSkeleton />
  ) : items.length ? (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((asset) => <AssetCard key={asset.id} asset={asset} onOpen={openAsset} />)}
      </div>
      {assets.hasNextPage && (
        <Button variant="white" className="self-center" onClick={() => void assets.fetchNextPage()} disabled={assets.isFetchingNextPage}>
          Показать ещё · {items.length} из {total}
        </Button>
      )}
    </div>
  ) : (
    <div className="card-surface">
      <EmptyState
        icon={Images}
        title={filters.active ? 'Ничего не нашлось' : 'Медиатека пуста'}
        description={filters.active ? 'Попробуйте другой фильтр или сбросьте поиск.' : 'Перетащите фото и видео на окно или нажмите «Загрузить». Видео — до 2 ГБ.'}
        action={!filters.active && <Button onClick={() => fileInput.current?.click()}><Upload /> Загрузить файлы</Button>}
      />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title="Медиатека" subtitle={subtitle} actions={uploadButton}>
        <MediaSectionTabs />
      </PageHeader>
      <div className="flex flex-col gap-5 px-4 lg:px-0">
        <LibraryFilters filters={filters} tags={tagsData?.data ?? []} />
        {body}
      </div>

      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files?.length) upload([...event.target.files]);
          event.target.value = '';
        }}
      />

      <AnimatePresence>
        {dragging && storage?.configured !== false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-brand-950/40 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3 rounded-frame bg-white px-12 py-10 text-center shadow-float">
              <UploadCloud className="h-12 w-12 text-brand-700" />
              <div className="text-[19px] font-bold text-ink">Отпустите — загрузим в медиатеку</div>
              {filters.tag && <div className="text-[13px] text-ink-muted">С меткой #{filters.tag}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AssetDetailSheet assetId={params.get(ASSET_PARAM)} onClose={closeAsset} />
    </div>
  );
};
