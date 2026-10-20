import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { WORK_PARAM } from '@/app/paths';

/** Открытая работа журнала — id в `?work=`, поверх текущего экрана; «назад» закрывает. */
export const useWorkParam = () => {
  const [params, setParams] = useSearchParams();
  const openId = params.get(WORK_PARAM);

  const openWork = useCallback(
    (id: string) =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.set(WORK_PARAM, id);
        return next;
      }),
    [setParams],
  );

  const closeWork = useCallback(
    () =>
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.delete(WORK_PARAM);
        return next;
      }, { replace: true }),
    [setParams],
  );

  return { openId, openWork, closeWork };
};
