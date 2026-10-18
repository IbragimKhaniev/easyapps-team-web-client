import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { getListMediaPostsQueryKey, useCreateMediaPost, useScheduleMediaPost, useUpdateMediaPost } from '@/api/generated/media-posts/media-posts';
import type { MediaPost, MediaPostListResponse } from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';
import { formatLongDate } from '@/lib/dates';
import { localTimeOf, publishMomentOf } from '../../lib/calendar';
import { putPostEverywhere, refreshPostViews } from '../../lib/cache';
import { isEditable } from '../../lib/status';

/**
 * Правки прямо из календаря: перенести пост на другой день (запланированный —
 * в то же время нового дня) и записать идею одной строкой.
 */
export const usePlanMoves = () => {
  const queryClient = useQueryClient();
  const update = useUpdateMediaPost();
  const schedule = useScheduleMediaPost();
  const create = useCreateMediaPost();

  const movePost = useCallback(async (post: MediaPost, date: string): Promise<void> => {
    if (post.plannedDate === date) return;
    if (!isEditable(post.status)) {
      toast.error('Пост уже вышел или публикуется — перенести его нельзя');
      return;
    }
    // Сразу показать пост в новом дне; ошибка вернёт как было.
    const snapshot = queryClient.getQueriesData<MediaPostListResponse>({ queryKey: getListMediaPostsQueryKey() });
    putPostEverywhere(queryClient, { ...post, plannedDate: date });
    try {
      const result = post.status === 'scheduled' && post.publishAt
        ? await schedule.mutateAsync({ id: post.id, data: { plannedDate: date, publishAt: publishMomentOf(date, localTimeOf(post.publishAt)) } })
        : await update.mutateAsync({ id: post.id, data: { plannedDate: date } });
      putPostEverywhere(queryClient, result.data);
      toast.success(`«${post.title}» — на ${formatLongDate(date)}`);
    } catch (error) {
      for (const [key, value] of snapshot) queryClient.setQueryData(key, value);
      toast.error(apiErrorMessage(error, 'Не удалось перенести пост'));
    } finally {
      refreshPostViews(queryClient, post.id);
    }
  }, [queryClient, schedule, update]);

  const addIdea = useCallback(async (date: string, title: string): Promise<boolean> => {
    try {
      await create.mutateAsync({ data: { title, plannedDate: date, idea: true } });
      refreshPostViews(queryClient);
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось записать идею'));
      return false;
    }
  }, [create, queryClient]);

  return { movePost, addIdea, adding: create.isPending };
};
