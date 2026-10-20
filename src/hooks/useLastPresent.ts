import { useState } from 'react';

/**
 * Последнее непустое значение. Окно по `?entry=` / `?work=` закрывается с
 * анимацией: id в адресе уже пуст, а окно ещё видно — запрос по последнему id
 * держит в нём ту же запись, иначе вместо неё мелькает «не найдена».
 */
export const useLastPresent = <T>(value: T | null | undefined): T | null => {
  const [last, setLast] = useState<T | null>(value ?? null);
  if (value != null && value !== last) setLast(value);
  return value ?? last;
};
