import type { PluginStatus } from '@/api/models';

/** Версия плагина на компьютере против последней: подпись и цвет метки; у коннектора Claude плагина нет. */
export const PLUGIN_STATUS_META: Record<PluginStatus, { label: string; chip: string }> = {
  current: { label: 'актуальная', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  outdated: { label: 'устарела', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  unknown: { label: 'версия неизвестна', chip: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  connector: { label: 'коннектор Claude', chip: 'bg-brand-50 text-brand-800 border-brand-100' },
};
