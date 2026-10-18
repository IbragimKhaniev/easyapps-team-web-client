import { useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX, Globe, HardDrive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getGetMediaStorageStatusQueryKey, useApplyMediaStorageCors, useGetMediaStorageStatus } from '@/api/generated/media-assets/media-assets';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/errors';
import { FILE_FORMS, pluralize } from '@/lib/plural';
import { formatBytes } from '../../lib/format';

/** Личное S3 медиатеки: на связи ли, сколько занято, CORS для превью и видео в браузере. */
export const StorageCard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetMediaStorageStatus();
  const cors = useApplyMediaStorageCors();
  const storage = data?.data;

  const applyCors = async () => {
    try {
      await cors.mutateAsync();
      void queryClient.invalidateQueries({ queryKey: getGetMediaStorageStatusQueryKey() });
      toast.success('Бакет открыт на чтение нашим сайтам');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось настроить CORS'));
    }
  };

  return (
    <Card title={<span className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-brand-800" /> Хранилище медиатеки</span>}>
      {isLoading || !storage ? (
        <div className="skeleton h-24 rounded-2xl" />
      ) : !storage.configured ? (
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          Не подключено. Задайте секреты сервиса team-api: <code className="rounded bg-secondary px-1">MEDIA_S3_ENDPOINT</code>, <code className="rounded bg-secondary px-1">MEDIA_S3_BUCKET</code>,{' '}
          <code className="rounded bg-secondary px-1">MEDIA_S3_ACCESS_KEY</code>, <code className="rounded bg-secondary px-1">MEDIA_S3_SECRET_KEY</code> — и выкатите сервис.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            {storage.ok ? <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
            <div className="min-w-0 text-[13.5px]">
              <div className="font-bold text-ink">{storage.ok ? 'На связи' : 'Не отвечает'} · {storage.bucket}</div>
              <div className="truncate text-ink-muted">{storage.endpoint}</div>
              {storage.error && <div className="mt-1 text-rose-700">{storage.error}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-secondary px-3.5 py-3">
              <div className="text-[12px] font-semibold text-ink-muted">Файлов</div>
              <div className="text-[20px] font-extrabold text-ink tabular">{storage.assetsCount}</div>
            </div>
            <div className="rounded-2xl bg-secondary px-3.5 py-3">
              <div className="text-[12px] font-semibold text-ink-muted">Занято</div>
              <div className="text-[20px] font-extrabold text-ink tabular">{formatBytes(storage.totalBytes)}</div>
            </div>
          </div>
          <p className="text-[12.5px] leading-snug text-ink-muted">
            {pluralize(storage.assetsCount, FILE_FORMS)} хранится {storage.publicUrl ? 'по публичным ссылкам' : 'по подписанным ссылкам (живут час)'}. Для превью и видеоплеера браузеру нужен CORS бакета.
          </p>
          <Button variant="soft" className="self-start" onClick={() => void applyCors()} disabled={cors.isPending || !storage.ok}>
            {cors.isPending ? <Loader2 className="animate-spin" /> : <Globe />} Настроить CORS
          </Button>
        </div>
      )}
    </Card>
  );
};
