import { useQueryClient } from '@tanstack/react-query';
import { KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getListAgentKeysQueryKey, useListAgentKeys, useRevokeAgentKey } from '@/api/generated/agents/agents';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/errors';
import { AGENT_TITLES } from '../lib/journalMeta';

/** Мои ключи агентов: какой агент, когда работал, идёт ли автожурнал; отозвать. */
export const KeysCard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListAgentKeys();
  const revoke = useRevokeAgentKey();
  const keys = data?.data ?? [];

  const onRevoke = async (id: string) => {
    try {
      await revoke.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: getListAgentKeysQueryKey() });
      toast.success('Ключ отозван — агент с ним больше не войдёт');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось отозвать ключ'));
    }
  };

  return (
    <Card title="Мои ключи">
      {isLoading ? (
        <div className="skeleton h-20 rounded-2xl" />
      ) : keys.length ? (
        <ul className="flex flex-col divide-y divide-black/[0.05]">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-ink-soft">
                <KeyRound className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-bold text-ink">{key.name}</div>
                <div className="truncate text-[12px] text-ink-faint">
                  {AGENT_TITLES[key.client]} · {key.hint}
                  {key.lastClient ? ` · ${key.lastClient}` : ' · ещё не подключался'}
                  {key.lastUsedAt ? ` · ${timeAgo(key.lastUsedAt)}` : ''}
                  {key.hooksSeenAt ? ' · автожурнал работает' : ''}
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => void onRevoke(key.id)} disabled={revoke.isPending} aria-label="Отозвать ключ" title="Отозвать ключ">
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-ink-muted">Ключей нет — выпустите первый в мастере подключения.</p>
      )}
    </Card>
  );
};
