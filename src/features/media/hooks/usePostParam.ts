import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { NEW_POST, POST_DATE_PARAM, POST_MEDIA_PARAM, POST_PARAM } from '@/app/paths';

/**
 * Открытый конструктор поста — в адресе, поверх текущего экрана:
 * `?post=<id>` — пост, `?post=new&date=2026-10-20` — новый на этот день,
 * `&media=<id>` — сразу с этим файлом медиатеки (ролик конвейера и т. п.).
 * Ссылку на пост можно переслать, «назад» закрывает конструктор.
 */
export const usePostParam = () => {
  const [params, setParams] = useSearchParams();
  const openId = params.get(POST_PARAM);
  const newDate = params.get(POST_DATE_PARAM);
  const newMediaId = params.get(POST_MEDIA_PARAM);

  const openPost = useCallback(
    (id: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(POST_PARAM, id);
        next.delete(POST_DATE_PARAM);
        next.delete(POST_MEDIA_PARAM);
        return next;
      }),
    [setParams],
  );

  const openNewPost = useCallback(
    (date: string, mediaId?: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(POST_PARAM, NEW_POST);
        next.set(POST_DATE_PARAM, date);
        if (mediaId) next.set(POST_MEDIA_PARAM, mediaId);
        else next.delete(POST_MEDIA_PARAM);
        return next;
      }),
    [setParams],
  );

  /** Новый пост сохранился — адрес меняется на его id, конструктор остаётся открытым. */
  const replaceWithPost = useCallback(
    (id: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(POST_PARAM, id);
        next.delete(POST_DATE_PARAM);
        next.delete(POST_MEDIA_PARAM);
        return next;
      }, { replace: true }),
    [setParams],
  );

  const closePost = useCallback(
    () =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.delete(POST_PARAM);
        next.delete(POST_DATE_PARAM);
        next.delete(POST_MEDIA_PARAM);
        return next;
      }, { replace: true }),
    [setParams],
  );

  return {
    openId: openId && openId !== NEW_POST ? openId : null,
    isNew: openId === NEW_POST,
    newDate,
    newMediaId: openId === NEW_POST ? newMediaId : null,
    isOpen: Boolean(openId),
    openPost,
    openNewPost,
    replaceWithPost,
    closePost,
  };
};
