import { useQueryClient } from '@tanstack/react-query';

import { useGetMediaAsset } from '@/api/generated/media-assets/media-assets';
import { getGetMediaPostQueryKey, useGetMediaPost } from '@/api/generated/media-posts/media-posts';
import type { MediaPost, MediaPostDetail, MediaPostDetailResponse } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { todayIso } from '@/lib/dates';
import { useIntegrationsState } from '../hooks/useIntegrationsState';
import { usePostParam } from '../hooks/usePostParam';
import { PostComposer } from './PostComposer';

/** Пока площадки публикуются — перечитываем пост раз в столько. */
const IN_FLIGHT_REFRESH_MS = 4_000;

const isInFlight = (response: MediaPostDetailResponse | undefined): boolean =>
  Boolean(response && (response.data.status === 'publishing'
    || response.data.targets.some((target) => target.status === 'publishing' || target.status === 'processing')));

const ComposerSkeleton = () => (
  <div className="flex flex-col gap-4 p-6">
    <div className="skeleton h-10 w-2/3 rounded-xl" />
    <div className="skeleton h-16 rounded-2xl" />
    <div className="skeleton h-48 rounded-2xl" />
  </div>
);

/**
 * Конструктор поверх любого экрана по `?post=…`. Пока статус публикации
 * меняется (идёт публикация, Instagram обрабатывает видео), пост
 * перечитывается сам — видно, как площадки выходят одна за другой.
 */
export const PostComposerSheet = () => {
  const queryClient = useQueryClient();
  const { openId, isNew, newDate, newMediaId, isOpen, closePost, replaceWithPost } = usePostParam();
  // Новый пост включает подключённые площадки — для этого список площадок нужен до первого кадра.
  const { isLoading: platformsLoading } = useIntegrationsState();

  const { data, isLoading } = useGetMediaPost(openId ?? '', {
    query: {
      enabled: Boolean(openId),
      refetchInterval: (query) => (isInFlight(query.state.data) ? IN_FLIGHT_REFRESH_MS : false),
    },
  });
  const post = openId ? data?.data ?? null : null;
  // Новый пост с файлом (ролик из конвейера, файл из медиатеки): файл нужен до первого кадра черновика.
  const { data: mediaData, isLoading: mediaLoading } = useGetMediaAsset(newMediaId ?? '', { query: { enabled: Boolean(newMediaId) } });
  const initialAsset = newMediaId ? mediaData?.data ?? null : null;

  const onCreated = (created: MediaPost, media: MediaPostDetail['media']) => {
    // Карточка нового поста — сразу в кэш: конструктор не мигает загрузкой при смене адреса.
    queryClient.setQueryData<MediaPostDetailResponse>(getGetMediaPostQueryKey(created.id), { success: true, data: { ...created, media } });
    replaceWithPost(created.id);
  };

  const ready = (isNew && !platformsLoading && !(newMediaId && mediaLoading)) || Boolean(post);

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(open) => !open && closePost()}
      title={post?.title ?? 'Новый пост'}
      desktopClassName="h-[min(94vh,920px)] max-w-[1180px] overflow-hidden"
      mobileClassName="h-[96dvh]"
    >
      {!ready && (isLoading || platformsLoading || mediaLoading || !openId) ? (
        <ComposerSkeleton />
      ) : ready ? (
        <PostComposer
          key={post?.id ?? `new-${newDate}-${newMediaId ?? ''}`}
          post={post}
          newDate={newDate ?? todayIso()}
          initialAsset={initialAsset}
          onClose={closePost}
          onCreated={onCreated}
        />
      ) : (
        <div className="p-10 text-center text-sm text-ink-muted">Пост не найден — возможно, его убрали из плана.</div>
      )}
    </ResponsiveDialog>
  );
};
