import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateMediaPost,
  useDeleteMediaPost,
  useDuplicateMediaPost,
  usePublishMediaPostNow,
  useRetryMediaPostTarget,
  useScheduleMediaPost,
  useUnscheduleMediaPost,
  useUpdateMediaPost,
} from '@/api/generated/media-posts/media-posts';
import type { MediaPost, PostIssue, SocialPlatform } from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';
import { formatDateTime } from '@/lib/dates';
import { publishMomentOf } from '../../lib/calendar';
import { putPostEverywhere, refreshPostViews, removePostEverywhere } from '../../lib/cache';
import { PLATFORM_META } from '../../lib/platforms';
import { draftToCreate, draftToUpdate, type IComposerDraft } from '../model';

/** 400 POST_NOT_READY: сервер прислал, что мешает посту выйти. */
const issuesOfError = (error: unknown): PostIssue[] | null => {
  if (!isAxiosError(error)) return null;
  const body = error.response?.data as { error?: { code?: string; details?: { issues?: PostIssue[] } } } | undefined;
  return body?.error?.code === 'POST_NOT_READY' ? body.error.details?.issues ?? [] : null;
};

export type TPostAction = 'save' | 'schedule' | 'unschedule' | 'publish' | 'retry' | 'duplicate' | 'remove';

/**
 * Действия конструктора поста. Каждое сохраняет черновик (если он менялся)
 * и потом делает своё — человеку не нужно помнить «сначала Сохранить».
 * Ошибки готовности (`POST_NOT_READY`) не тостом, а списком в конструкторе.
 */
export const usePostActions = () => {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<TPostAction | null>(null);
  const [blockingIssues, setBlockingIssues] = useState<PostIssue[] | null>(null);

  const create = useCreateMediaPost();
  const update = useUpdateMediaPost();
  const schedule = useScheduleMediaPost();
  const unschedule = useUnscheduleMediaPost();
  const publishNow = usePublishMediaPostNow();
  const retry = useRetryMediaPostTarget();
  const duplicate = useDuplicateMediaPost();
  const remove = useDeleteMediaPost();

  const withBusy = useCallback(async <T,>(action: TPostAction, work: () => Promise<T>): Promise<T | undefined> => {
    setBusy(action);
    setBlockingIssues(null);
    try {
      return await work();
    } catch (error) {
      const issues = issuesOfError(error);
      if (issues) setBlockingIssues(issues);
      else toast.error(apiErrorMessage(error));
      return undefined;
    } finally {
      setBusy(null);
    }
  }, []);

  const applied = useCallback((post: MediaPost): MediaPost => {
    putPostEverywhere(queryClient, post);
    refreshPostViews(queryClient, post.id);
    return post;
  }, [queryClient]);

  /** Записать черновик перед действием: новый — создать, изменённый — обновить. Возвращает id поста. */
  const persist = useCallback(async (postId: string | null, draft: IComposerDraft, dirty: boolean): Promise<string> => {
    if (!postId) return applied((await create.mutateAsync({ data: draftToCreate(draft) })).data).id;
    if (dirty) applied((await update.mutateAsync({ id: postId, data: draftToUpdate(draft) })).data);
    return postId;
  }, [applied, create, update]);

  /** «Сохранить»: null — менять было нечего. */
  const save = useCallback((postId: string | null, draft: IComposerDraft, dirty: boolean, idea = false) =>
    withBusy('save', async (): Promise<MediaPost | null> => {
      if (postId && !dirty) return null;
      const post = postId
        ? applied((await update.mutateAsync({ id: postId, data: draftToUpdate(draft) })).data)
        : applied((await create.mutateAsync({ data: draftToCreate(draft, idea) })).data);
      toast.success(idea ? 'Идея в плане' : 'Сохранено');
      return post;
    }), [applied, create, update, withBusy]);

  const schedulePost = useCallback((postId: string | null, draft: IComposerDraft, dirty: boolean) =>
    withBusy('schedule', async () => {
      const id = await persist(postId, draft, dirty);
      const publishAt = publishMomentOf(draft.plannedDate, draft.time);
      const post = applied((await schedule.mutateAsync({ id, data: { publishAt, plannedDate: draft.plannedDate } })).data);
      toast.success(`Запланирован на ${formatDateTime(publishAt)}`);
      return post;
    }), [applied, persist, schedule, withBusy]);

  const publishPost = useCallback((postId: string | null, draft: IComposerDraft, dirty: boolean) =>
    withBusy('publish', async () => {
      const id = await persist(postId, draft, dirty);
      const post = applied((await publishNow.mutateAsync({ id, data: {} })).data);
      toast.success('Публикуем — статус площадок обновится через несколько секунд');
      return post;
    }), [applied, persist, publishNow, withBusy]);

  const unschedulePost = useCallback((postId: string) =>
    withBusy('unschedule', async () => {
      const post = applied((await unschedule.mutateAsync({ id: postId })).data);
      toast.success('Снят с расписания — снова черновик');
      return post;
    }), [applied, unschedule, withBusy]);

  const retryTarget = useCallback((postId: string, platform: SocialPlatform) =>
    withBusy('retry', async () => {
      const post = applied((await retry.mutateAsync({ id: postId, platform })).data);
      toast.success(`${PLATFORM_META[platform].title}: публикуем ещё раз`);
      return post;
    }), [applied, retry, withBusy]);

  const duplicatePost = useCallback((postId: string) =>
    withBusy('duplicate', async () => {
      const post = (await duplicate.mutateAsync({ id: postId })).data;
      refreshPostViews(queryClient);
      toast.success('Копия — в черновиках того же дня');
      return post;
    }), [duplicate, queryClient, withBusy]);

  const removePost = useCallback((postId: string) =>
    withBusy('remove', async () => {
      await remove.mutateAsync({ id: postId });
      removePostEverywhere(queryClient, postId);
      refreshPostViews(queryClient);
      toast.success('Пост убран из плана');
      return true;
    }), [queryClient, remove, withBusy]);

  return {
    busy,
    blockingIssues,
    clearIssues: () => setBlockingIssues(null),
    save,
    schedulePost,
    publishPost,
    unschedulePost,
    retryTarget,
    duplicatePost,
    removePost,
  };
};
