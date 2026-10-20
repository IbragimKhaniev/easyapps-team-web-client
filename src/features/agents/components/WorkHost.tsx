import { lazy, Suspense } from 'react';

import { useWorkParam } from '../hooks/useWorkParam';

const WorkSheet = lazy(async () => ({ default: (await import('./WorkSheet')).WorkSheet }));

/** Работа журнала поверх любого экрана; код карточки грузится, только когда в адресе есть `?work=`. */
export const WorkHost = () => {
  const { openId } = useWorkParam();
  if (!openId) return null;
  return (
    <Suspense fallback={null}>
      <WorkSheet />
    </Suspense>
  );
};
