import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { TASK_PARAM } from '@/app/paths';

/** Открытая карточка задачи — ключ в `?task=`, поверх текущего экрана. */
export const useTaskParam = () => {
  const [params, setParams] = useSearchParams();
  const openKey = params.get(TASK_PARAM);

  const openTask = useCallback(
    (key: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(TASK_PARAM, key);
        return next;
      }),
    [setParams],
  );

  const closeTask = useCallback(
    () =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.delete(TASK_PARAM);
        return next;
      }, { replace: true }),
    [setParams],
  );

  return { openKey, openTask, closeTask };
};
