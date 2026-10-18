import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Loader2, Music, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useDeleteMediaAsset,
  useGetMediaAsset,
  useListMediaAssetTags,
  useUpdateMediaAsset,
} from '@/api/generated/media-assets/media-assets';
import type { MediaAssetDetail, MediaPostStatus } from '@/api/models';
import { postHref } from '@/app/paths';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime, formatLongDate } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/errors';
import { PostStatusPill } from '../../components/StatusPill';
import { refreshLibraryViews } from '../../lib/cache';
import { formatBytes, formatDuration, MEDIA_KIND_LABELS } from '../../lib/format';
import { TagEditor } from './TagEditor';

interface IAssetDetailSheetProps {
  assetId: string | null;
  onClose: () => void;
}

const Preview = ({ asset }: { asset: MediaAssetDetail }) => {
  if (asset.kind === 'image' && asset.url) {
    return <img src={asset.url} alt={asset.title} className="max-h-[52vh] w-full rounded-2xl bg-secondary object-contain" />;
  }
  if (asset.kind === 'video' && asset.url) {
    return <video src={asset.url} poster={asset.thumbnailUrl ?? undefined} controls playsInline className="max-h-[52vh] w-full rounded-2xl bg-black" />;
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-secondary px-6 py-10">
      {asset.kind === 'audio' ? <Music className="h-10 w-10 text-brand-800" /> : <FileText className="h-10 w-10 text-brand-800" />}
      <span className="text-[14px] font-semibold text-ink">{asset.fileName}</span>
      {asset.kind === 'audio' && asset.url && <audio src={asset.url} controls className="w-full max-w-sm" />}
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-[13.5px]">
    <span className="text-ink-muted">{label}</span>
    <span className="truncate font-semibold text-ink">{value}</span>
  </div>
);

/** Карточка файла: просмотр, название, метки, описание, где используется, скачать и удалить. */
export const AssetDetailSheet = ({ assetId, onClose }: IAssetDetailSheetProps) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetMediaAsset(assetId ?? '', { query: { enabled: Boolean(assetId) } });
  const { data: tagsData } = useListMediaAssetTags({ query: { enabled: Boolean(assetId) } });
  const update = useUpdateMediaAsset();
  const remove = useDeleteMediaAsset();
  const asset = data?.data;

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setTitle(asset.title);
    setTags(asset.tags);
    setDescription(asset.description ?? '');
  }, [asset]);

  const dirty = Boolean(asset) && (title !== asset?.title || JSON.stringify(tags) !== JSON.stringify(asset?.tags) || description !== (asset?.description ?? ''));

  const save = async () => {
    if (!asset) return;
    try {
      await update.mutateAsync({ id: asset.id, data: { title: title.trim() || asset.title, tags, description: description.trim() || null } });
      refreshLibraryViews(queryClient, asset.id);
      toast.success('Сохранено');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const destroy = async () => {
    if (!asset) return;
    try {
      await remove.mutateAsync({ id: asset.id });
      refreshLibraryViews(queryClient);
      toast.success('Файл удалён');
      onClose();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось удалить файл'));
    }
  };

  return (
    <ResponsiveDialog
      open={Boolean(assetId)}
      onOpenChange={(open) => !open && onClose()}
      title={asset?.title ?? 'Файл'}
      desktopClassName="h-[min(92vh,880px)] max-w-[1000px] overflow-hidden"
      mobileClassName="h-[94dvh]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-3 lg:px-6">
        <span className="truncate text-[17px] font-bold text-ink">{asset?.title ?? 'Файл'}</span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Закрыть">
          <X />
        </Button>
      </div>
      {isLoading || !asset ? (
        <div className="flex flex-col gap-4 p-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-11 rounded-xl" />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-5 lg:p-6">
            <Preview asset={asset} />
          </div>
          <div className="flex flex-col gap-5 border-black/[0.06] px-5 pb-6 lg:border-l lg:p-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Название</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Метки</span>
              <TagEditor tags={tags} onChange={setTags} suggestions={tagsData?.data.map((item) => item.tag)} />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Описание</span>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Откуда файл, права, для чего снимали" />
            </label>
            {dirty && (
              <Button onClick={() => void save()} disabled={update.isPending}>
                {update.isPending && <Loader2 className="animate-spin" />} Сохранить
              </Button>
            )}

            <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-secondary">
              <MetaRow label="Тип" value={`${MEDIA_KIND_LABELS[asset.kind]} · ${asset.mimeType}`} />
              <MetaRow label="Размер" value={formatBytes(asset.size)} />
              {asset.width && asset.height && <MetaRow label="Кадр" value={`${asset.width} × ${asset.height}`} />}
              {asset.durationSec && <MetaRow label="Длительность" value={formatDuration(asset.durationSec)} />}
              <MetaRow label="Загружен" value={formatDateTime(asset.createdAt)} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Где используется</span>
              {asset.usage.length ? (
                asset.usage.map((usage) => (
                  <Link key={usage.postId} to={postHref(usage.postId)} onClick={onClose} className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 transition-colors hover:bg-brand-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{usage.title}</span>
                      <span className="block text-[12px] text-ink-muted">{formatLongDate(usage.plannedDate)}</span>
                    </span>
                    <PostStatusPill status={usage.status as MediaPostStatus} />
                  </Link>
                ))
              ) : (
                <p className="text-[13px] text-ink-muted">Ни в одном посте плана.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {asset.url && (
                <Button variant="soft" asChild>
                  <a href={asset.url} download={asset.fileName} target="_blank" rel="noreferrer">
                    <Download /> Скачать
                  </a>
                </Button>
              )}
              <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
            <AlertDialogDescription>Файл удалится из хранилища. В уже вышедших постах он останется — площадки хранят свои копии.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => void destroy()}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveDialog>
  );
};
