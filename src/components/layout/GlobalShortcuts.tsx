import { useEffect } from 'react';

import { uiActions } from '@/app/uiStore';

/** Ввод текста: в полях клавиши-команды не перехватываем. */
const isTyping = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName);
};

/** Клавиатура компьютера: ⌘K — палитра, C — новая задача. */
export const GlobalShortcuts = () => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        uiActions.togglePalette();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (event.key === 'c' || event.key === 'с') {
        event.preventDefault();
        uiActions.openQuickAdd();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
};
