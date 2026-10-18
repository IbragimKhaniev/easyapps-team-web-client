import { useLayoutEffect, type RefObject } from 'react';

/** Поле растёт вместе с текстом — без внутренней прокрутки. */
export const useAutosizeTextarea = (ref: RefObject<HTMLTextAreaElement | null>, value: string): void => {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [ref, value]);
};
