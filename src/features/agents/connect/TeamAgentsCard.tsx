import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  getGetAgentsTeamStatusQueryKey,
  getListAgentKeysQueryKey,
  useGetAgentsTeamStatus,
  useRemoveTeamAgentKey,
} from '@/api/generated/agents/agents';
import type { AgentComputer } from '@/api/models';
import { Card } from '@/components/common/Card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { timeAgo } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { PluginVersionChip } from '../components/PluginVersionChip';

const TEAM_REFRESH_MS = 30_000;

/** Компьютер, который администратор собрался отключить, и чей он. */
interface IRemoving {
  computer: AgentComputer;
  memberName: string;
}

/**
 * Кто в команде работает через агента: подключение, автожурнал, работы за
 * неделю и версия плагина на каждом компьютере — устаревшие видно сразу.
 * Администратор может удалить ключ любого компьютера.
 */
export const TeamAgentsCard = () => {
  const queryClient = useQueryClient();
  const { map: members } = useMembers();
  const { isAdmin } = useSession();
  const { data } = useGetAgentsTeamStatus({ query: { refetchInterval: TEAM_REFRESH_MS } });
  const removeKey = useRemoveTeamAgentKey();
  const [removing, setRemoving] = useState<IRemoving | null>(null);
  const status = data?.data;
  const rows = status?.members ?? [];
  const outdated = rows.filter((row) => row.outdated).length;

  const remove = async (target: IRemoving): Promise<boolean> => {
    try {
      await removeKey.mutateAsync({ id: target.computer.keyId });
      toast.success(`Ключ «${target.computer.host ?? target.computer.name}» удалён — агент на нём больше не войдёт`);
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось удалить ключ'));
      return false;
    } finally {
      void queryClient.invalidateQueries({ queryKey: getGetAgentsTeamStatusQueryKey() });
      void queryClient.invalidateQueries({ queryKey: getListAgentKeysQueryKey() });
    }
  };

  return (
    <Card
      title="Команда"
      action={status && (
        <span className={cn('text-[12px] font-semibold', outdated ? 'text-amber-800' : 'text-ink-faint')}>
          Плагин {status.latestPluginVersion}{outdated ? ` · обновиться: ${outdated}` : ''}
        </span>
      )}
    >
      <ul className="flex flex-col divide-y divide-black/[0.05]">
        {rows.map((row) => {
          const member = members.get(row.userId);
          const connected = Boolean(row.lastUsedAt);
          return (
            <li key={row.userId} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <MemberAvatar member={member} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="max-w-full truncate text-[14.5px] font-bold text-ink">{member?.name ?? 'Участник'}</span>
                    {row.activeWork > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">работает сейчас</span>
                    )}
                  </div>
                  <div className="truncate text-[12px] text-ink-faint">
                    {connected
                      ? `${row.clients.join(', ') || 'агент'} · ${timeAgo(row.lastUsedAt!)}${row.hooksSeenAt ? ' · автожурнал' : ' · без автожурнала'}`
                      : 'агент не подключён'}
                  </div>
                </div>
                <span className={cn('shrink-0 text-right text-[12px] font-semibold', row.workLast7Days ? 'text-ink' : 'text-ink-faint')}>
                  {row.workLast7Days}
                  <span className="block text-[11px] font-medium text-ink-faint">за 7 дней</span>
                </span>
              </div>
              {row.computers.length > 0 && (
                <ul className="ml-12 flex flex-col gap-1">
                  {row.computers.map((computer) => (
                    <li key={computer.keyId} className="group flex min-w-0 items-center gap-2">
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-muted">
                        {/* Узкая колонка: метка версии уходит строкой ниже, а не съедает имя компьютера. */}
                        <span className="min-w-0 max-w-full truncate" title={`${computer.host ?? computer.name}${computer.lastClient ? ` · ${computer.lastClient}` : ''}`}>
                          {computer.host ?? computer.name}{computer.lastClient ? ` · ${computer.lastClient}` : ''}
                        </span>
                        <PluginVersionChip version={computer.pluginVersion} status={computer.pluginStatus} />
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 shrink-0 text-ink-faint hover:bg-rose-50 hover:text-rose-600 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100"
                          onClick={() => setRemoving({ computer, memberName: member?.name ?? 'участник' })}
                          aria-label="Удалить ключ компьютера"
                          title="Удалить ключ компьютера"
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {isAdmin && removing && (
        <ConfirmDialog
          open={Boolean(removing)}
          onOpenChange={(open) => !open && setRemoving(null)}
          title={`Удалить ключ «${removing.computer.host ?? removing.computer.name}»?`}
          description={(
            <>
              Ключ участника {removing.memberName}
              {removing.computer.lastClient ? ` (${removing.computer.lastClient})` : ''}. Агент с этим ключом сразу
              потеряет доступ к задачам и журналу
              {removing.computer.pluginStatus === 'connector' ? ', а коннектор Claude попросит войти заново' : ''}. Работы в
              журнале останутся. Вернуть доступ — новой командой установки или новым входом коннектора.
            </>
          )}
          confirmLabel="Удалить ключ"
          onConfirm={() => remove(removing)}
        />
      )}
    </Card>
  );
};
