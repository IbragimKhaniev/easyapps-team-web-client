import { CircleAlert, CircleCheck, CircleHelp } from 'lucide-react';

import { PluginStatus } from '@/api/models';
import { cn } from '@/lib/utils';
import { PLUGIN_STATUS_META } from '../lib/pluginMeta';

const ICONS = {
  [PluginStatus.current]: CircleCheck,
  [PluginStatus.outdated]: CircleAlert,
  [PluginStatus.unknown]: CircleHelp,
} as const;

interface IPluginVersionChipProps {
  version: string | null;
  status: PluginStatus;
  className?: string;
}

/** Метка версии плагина: «1.4.0 · устарела» — по ней видно, кому пора обновиться. */
export const PluginVersionChip = ({ version, status, className }: IPluginVersionChipProps) => {
  const meta = PLUGIN_STATUS_META[status];
  const Icon = ICONS[status];
  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-bold', meta.chip, className)}
      title={status === PluginStatus.outdated ? 'Вышла новая версия плагина — агент попросит обновиться' : undefined}
    >
      <Icon className="h-3 w-3" />
      {version ? `${version} · ${meta.label}` : meta.label}
    </span>
  );
};
