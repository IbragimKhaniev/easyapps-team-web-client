import { useSyncExternalStore } from 'react';

import type { TaskPriority, TaskStatus } from '@/api/models';

/**
 * Глобальное состояние интерфейса, которое открывают из разных мест:
 * быстрое добавление задачи («+» в таббаре, кнопка в шапке, клавиша C) и
 * палитра команд (⌘K). Маленький стор на useSyncExternalStore — без
 * сторонних библиотек.
 */

export interface IQuickAddDefaults {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

interface IUiState {
  quickAdd: { open: boolean; defaults: IQuickAddDefaults };
  palette: { open: boolean };
}

let state: IUiState = {
  quickAdd: { open: false, defaults: {} },
  palette: { open: false },
};

const listeners = new Set<() => void>();

const setState = (next: Partial<IUiState>): void => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const uiActions = {
  openQuickAdd: (defaults: IQuickAddDefaults = {}) => setState({ quickAdd: { open: true, defaults } }),
  closeQuickAdd: () => setState({ quickAdd: { open: false, defaults: state.quickAdd.defaults } }),
  openPalette: () => setState({ palette: { open: true } }),
  closePalette: () => setState({ palette: { open: false } }),
  togglePalette: () => setState({ palette: { open: !state.palette.open } }),
};

export const useUiState = <T>(select: (current: IUiState) => T): T =>
  useSyncExternalStore(subscribe, () => select(state), () => select(state));
