import { useInfiniteQuery } from '@tanstack/react-query';

import { getListMediaAssetsQueryKey, listMediaAssets } from '@/api/generated/media-assets/media-assets';
import type { ListMediaAssetsParams } from '@/api/models';

/** Файлов на страницу медиатеки. */
const PAGE_SIZE = 60;

/**
 * Медиатека страницами: «Показать ещё» дописывает следующую. Ключ начинается
 * с ключа списка — загрузка нового файла (invalidate списка) обновляет и её.
 */
export const useLibraryAssets = (params: Omit<ListMediaAssetsParams, 'page' | 'limit'>) =>
  useInfiniteQuery({
    queryKey: [...getListMediaAssetsQueryKey(params), 'pages'],
    queryFn: ({ pageParam, signal }) => listMediaAssets({ ...params, page: pageParam, limit: PAGE_SIZE }, undefined, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.hasNextPage ? last.pagination.page + 1 : undefined),
    placeholderData: (previous) => previous,
  });
