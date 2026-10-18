import type { QueryClient } from '@tanstack/react-query';

import { getGetMediaAnalyticsQueryKey } from '@/api/generated/media-analytics/media-analytics';
import { getGetMediaAssetQueryKey, getListMediaAssetsQueryKey } from '@/api/generated/media-assets/media-assets';
import { getListSocialPostsQueryKey } from '@/api/generated/media-feed/media-feed';
import { getListIntegrationsQueryKey, getListMediaJobsQueryKey } from '@/api/generated/media-integrations/media-integrations';
import {
  getGetMediaPostQueryKey,
  getGetMediaSummaryQueryKey,
  getListMediaPostsQueryKey,
} from '@/api/generated/media-posts/media-posts';
import type { MediaPost, MediaPostDetailResponse, MediaPostListResponse } from '@/api/models';

/**
 * Кэш медиасистемы. Ключи списков — `['/media/posts', params]`: префикс
 * `['/media/posts']` задевает все месяцы плана сразу.
 */

/** Пост изменился: месяцы плана, сводка, карточка поста и (после выхода) лента. */
export const refreshPostViews = (queryClient: QueryClient, postId?: string): void => {
  void queryClient.invalidateQueries({ queryKey: getListMediaPostsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetMediaSummaryQueryKey() });
  if (postId) void queryClient.invalidateQueries({ queryKey: getGetMediaPostQueryKey(postId) });
  void queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
};

/** Положить свежий пост во все месяцы плана сразу — без ожидания перезапроса. */
export const putPostEverywhere = (queryClient: QueryClient, post: MediaPost): void => {
  queryClient.setQueriesData<MediaPostListResponse>({ queryKey: getListMediaPostsQueryKey() }, (current) => {
    if (!current) return current;
    const exists = current.data.some((item) => item.id === post.id);
    return { ...current, data: exists ? current.data.map((item) => (item.id === post.id ? post : item)) : current.data };
  });
  queryClient.setQueryData<MediaPostDetailResponse>(getGetMediaPostQueryKey(post.id), (current) =>
    current ? { ...current, data: { ...current.data, ...post } } : current,
  );
};

export const removePostEverywhere = (queryClient: QueryClient, postId: string): void => {
  queryClient.setQueriesData<MediaPostListResponse>({ queryKey: getListMediaPostsQueryKey() }, (current) =>
    current ? { ...current, data: current.data.filter((item) => item.id !== postId) } : current,
  );
};

export const refreshLibraryViews = (queryClient: QueryClient, assetId?: string): void => {
  void queryClient.invalidateQueries({ queryKey: getListMediaAssetsQueryKey() });
  if (assetId) void queryClient.invalidateQueries({ queryKey: getGetMediaAssetQueryKey(assetId) });
};

export const refreshIntegrationViews = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: getListIntegrationsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getListMediaJobsQueryKey() });
};

export const refreshStatsViews = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetMediaAnalyticsQueryKey() });
};
