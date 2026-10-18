import { useSyncExternalStore } from 'react';

/** Подписка на CSS media query без лишних ре-рендеров. */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

/** С этой ширины — оболочка компьютера: сайдбар, панели, клавиатура. */
export const DESKTOP_QUERY = '(min-width: 1024px)';

export const useIsDesktop = (): boolean => useMediaQuery(DESKTOP_QUERY);
