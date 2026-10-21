import { useGetAgentsTeamStatus } from '@/api/generated/agents/agents';
import { Card } from '@/components/common/Card';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useMembers } from '@/hooks/useDirectory';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { PluginVersionChip } from '../components/PluginVersionChip';

const TEAM_REFRESH_MS = 30_000;

/**
 * Кто в команде работает через агента: подключение, автожурнал, работы за
 * неделю и версия плагина на каждом компьютере — устаревшие видно сразу.
 */
export const TeamAgentsCard = () => {
  const { map: members } = useMembers();
  const { data } = useGetAgentsTeamStatus({ query: { refetchInterval: TEAM_REFRESH_MS } });
  const status = data?.data;
  const rows = status?.members ?? [];
  const outdated = rows.filter((row) => row.outdated).length;

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
                    <li key={computer.keyId} className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-muted">
                      {/* Узкая колонка: метка версии уходит строкой ниже, а не съедает имя компьютера. */}
                      <span className="min-w-0 max-w-full truncate" title={`${computer.host ?? computer.name}${computer.lastClient ? ` · ${computer.lastClient}` : ''}`}>
                        {computer.host ?? computer.name}{computer.lastClient ? ` · ${computer.lastClient}` : ''}
                      </span>
                      <PluginVersionChip version={computer.pluginVersion} status={computer.pluginStatus} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
