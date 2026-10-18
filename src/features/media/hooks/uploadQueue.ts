import { useSyncExternalStore } from 'react';

import {
  getGetMediaStorageStatusQueryKey,
  getListMediaAssetsQueryKey,
  getListMediaAssetTagsQueryKey,
  uploadMediaAsset,
} from '@/api/generated/media-assets/media-assets';
import type { MediaAsset } from '@/api/models';
import { queryClient } from '@/app/queryClient';
import { apiErrorMessage } from '@/lib/errors';
import { inspectFile } from '../lib/fileInfo';
import { formatBytes } from '../lib/format';

/**
 * Очередь загрузок медиатеки. Живёт вне компонентов: файл продолжает
 * загружаться, когда закрыли окно выбора или ушли на другой экран, а
 * прогресс виден в общей панели загрузок.
 */

export type TUploadStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface IUploadItem {
  id: string;
  fileName: string;
  size: number;
  /** 0…1 */
  progress: number;
  status: TUploadStatus;
  error?: string;
  asset?: MediaAsset;
}

export interface IUploadOptions {
  tags?: string[];
  /** Файл в медиатеке — например, сразу добавить его в пост. */
  onUploaded?: (asset: MediaAsset) => void;
}

/** Самый большой файл — как на сервере. */
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024;
/** Два файла одновременно: быстрее одного и не душит канал. */
const PARALLEL_UPLOADS = 2;

let items: IUploadItem[] = [];
const files = new Map<string, { file: File; options: IUploadOptions }>();
const listeners = new Set<() => void>();
let active = 0;

const emit = (): void => listeners.forEach((listener) => listener());

const patch = (id: string, next: Partial<IUploadItem>): void => {
  items = items.map((item) => (item.id === id ? { ...item, ...next } : item));
  emit();
};

const refreshLibrary = (): void => {
  void queryClient.invalidateQueries({ queryKey: getListMediaAssetsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getListMediaAssetTagsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetMediaStorageStatusQueryKey() });
};

const run = async (id: string): Promise<void> => {
  const entry = files.get(id);
  if (!entry) return;
  active += 1;
  patch(id, { status: 'uploading', progress: 0 });
  try {
    const info = await inspectFile(entry.file);
    const response = await uploadMediaAsset(
      {
        file: entry.file,
        thumbnail: info.poster,
        tags: entry.options.tags?.length ? entry.options.tags.join(',') : undefined,
        width: info.width,
        height: info.height,
        durationSec: info.durationSec,
      },
      {
        // Файл может идти минутами — без общего таймаута axios.
        timeout: 0,
        onUploadProgress: (event) => patch(id, { progress: event.total ? event.loaded / event.total : 0 }),
      },
    );
    patch(id, { status: 'done', progress: 1, asset: response.data });
    entry.options.onUploaded?.(response.data);
    refreshLibrary();
  } catch (error) {
    patch(id, { status: 'error', error: apiErrorMessage(error, 'Не удалось загрузить файл') });
  } finally {
    files.delete(id);
    active -= 1;
    pump();
  }
};

function pump(): void {
  for (const item of items) {
    if (active >= PARALLEL_UPLOADS) return;
    if (item.status === 'queued' && files.has(item.id)) void run(item.id);
  }
}

export const uploadQueue = {
  /** Поставить файлы в очередь; возвращает id строк очереди (по ним виден прогресс). */
  add(selected: File[], options: IUploadOptions = {}): string[] {
    const added: IUploadItem[] = selected.map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const tooBig = file.size > UPLOAD_MAX_BYTES;
      if (!tooBig) files.set(id, { file, options });
      return {
        id,
        fileName: file.name,
        size: file.size,
        progress: 0,
        status: tooBig ? 'error' : 'queued',
        error: tooBig ? `Файл ${formatBytes(file.size)} — больше 2 ГБ` : undefined,
      };
    });
    items = [...items, ...added];
    emit();
    pump();
    return added.map((item) => item.id);
  },

  /** Убрать из панели готовые и упавшие. */
  clearFinished(): void {
    items = items.filter((item) => item.status === 'queued' || item.status === 'uploading');
    emit();
  },

  dismiss(id: string): void {
    items = items.filter((item) => item.id !== id || item.status === 'uploading');
    files.delete(id);
    emit();
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useUploadItems = (): IUploadItem[] => useSyncExternalStore(subscribe, () => items, () => items);
