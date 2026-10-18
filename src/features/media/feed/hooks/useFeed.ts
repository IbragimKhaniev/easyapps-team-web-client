import { useInfiniteQuery } from '@tanstack/react-query';

import { getListSocialPostsQueryKey, listSocialPosts } from '@/api/generated/media-feed/media-feed';
import type { ListSocialPostsParams } from '@/api/models';

const PAGE_SIZE = 30;
/** Метрики обновляет сборщик — ленту освежаем раз в минуту, пока она открыта. */
const FEED_REFRESH_MS = 60_000;

/** Лента постов площадок страницами; «Показать ещё» — следующая. */
export const useFeed = (params: Omit<ListSocialPostsParams, 'page' | 'limit'>) =>
  useInfiniteQuery({
    queryKey: [...getListSocialPostsQueryKey(params), 'pages'],
    queryFn: ({ pageParam, signal }) => listSocialPosts({ ...params, page: pageParam, limit: PAGE_SIZE }, undefined, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.hasNextPage ? last.pagination.page + 1 : undefined),
    placeholderData: (previous) => previous,
    refetchInterval: FEED_REFRESH_MS,
  });
