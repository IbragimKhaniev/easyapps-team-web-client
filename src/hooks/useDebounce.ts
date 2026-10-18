import { useEffect, useState } from 'react';

/** Значение, которое обновляется не чаще, чем раз в `delay` мс (поиск по мере ввода). */
export const useDebounce = <T,>(value: T, delay = 200): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
