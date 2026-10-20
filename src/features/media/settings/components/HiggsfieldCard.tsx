import { ChevronDown, LogIn, Power, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { useGetHiggsfieldState } from '@/api/generated/higgsfield/higgsfield';
import { HiggsfieldToolAccess, type HiggsfieldState, type HiggsfieldTool } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { formatDateTime } from '@/lib/dates';
import { CALL_FORMS, CREDIT_FORMS, GENERATION_FORMS, plural, pluralize } from '@/lib/plural';
import { cn } from '@/lib/utils';
import { useHiggsfieldActions } from '../hooks/useHiggsfieldActions';

const STATUS: Record<HiggsfieldState['status'], { label: string; pill: string }> = {
  connected: { label: 'Подключён', pill: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Ждём входа', pill: 'bg-amber-50 text-amber-800' },
  error: { label: 'Нужно переподключить', pill: 'bg-rose-50 text-rose-700' },
  disconnected: { label: 'Не подключён', pill: 'bg-zinc-100 text-zinc-600' },
};

const ACCESS: Record<HiggsfieldToolAccess, { label: string; className: string }> = {
  allowed: { label: 'открыт', className: 'text-emerald-700' },
  adminAllowed: { label: 'открыт админом', className: 'text-emerald-700' },
  adminDenied: { label: 'закрыт админом', className: 'text-ink-faint' },
  blocked: { label: 'опасное — закрыт', className: 'text-rose-700' },
  unknown: { label: 'новый — закрыт', className: 'text-amber-800' },
};

const isOpen = (access: HiggsfieldToolAccess): boolean => access === HiggsfieldToolAccess.allowed || access === HiggsfieldToolAccess.adminAllowed;
const RECENT_CALLS = 8;

/**
 * Общий аккаунт Higgsfield команды: админ подключает его один раз, и агенты
 * команды генерируют через MCP easyapps-team без своего входа. Здесь же —
 * доступ команды (рубильник и инструменты) и кто сколько генерировал.
 */
export const HiggsfieldCard = () => {
  const { data, isLoading } = useGetHiggsfieldState({ query: { refetchInterval: 30_000 } });
  const { isAdmin } = useSession();
  const { map: members } = useMembers();
  const actions = useHiggsfieldActions();
  const [toolsOpen, setToolsOpen] = useState(false);
  const state = data?.data;

  const toggleTool = (tool: HiggsfieldTool, open: boolean) => {
    if (!state) return;
    const allow = new Set(state.policy.allow);
    const deny = new Set(state.policy.deny);
    if (open) {
      deny.delete(tool.name);
      if (!isOpen(tool.access) && tool.access !== HiggsfieldToolAccess.adminDenied) allow.add(tool.name);
    } else {
      allow.delete(tool.name);
      if (tool.access === HiggsfieldToolAccess.allowed) deny.add(tool.name);
    }
    void actions.setPolicy({ allow: [...allow], deny: [...deny] });
  };

  const title = <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-brand-800" /> Higgsfield команды</span>;
  if (isLoading || !state) return <Card title={title}><div className="skeleton h-28 rounded-2xl" /></Card>;

  const status = STATUS[state.status];
  const connected = state.status === 'connected';
  const openTools = state.tools.filter((tool) => isOpen(tool.access)).length;

  return (
    <Card title={title} action={<span className={cn('rounded-full px-2.5 py-0.5 text-[12.5px] font-bold', status.pill)}>{status.label}</span>}>
      <div className="flex flex-col gap-4 text-[13.5px]">
        <p className="leading-relaxed text-ink-muted">
          Один аккаунт Higgsfield на всю команду: админ подключает его здесь, а агенты сотрудников генерируют кадры и клипы
          через MCP easyapps-team — без своего входа. Каждый вызов виден ниже.
        </p>

        {!state.canStoreSecrets && <p className="rounded-2xl bg-amber-50 p-3 text-amber-900">На сервере не задан ключ шифрования TEAM_SECRETS_KEY — подключить аккаунт нельзя.</p>}
        {state.lastError && state.status !== 'connected' && <p className="rounded-2xl bg-rose-50 p-3 text-rose-800">{state.lastError}</p>}
        {state.status === 'pending' && <p className="rounded-2xl bg-amber-50 p-3 text-amber-900">Вход в Higgsfield начат, но не завершён. Закрыли окно — нажмите «Подключить» ещё раз.</p>}

        {connected && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-secondary px-3.5 py-3">
              <div className="text-[12px] font-semibold text-ink-muted">Баланс</div>
              <div className="text-[20px] font-bold text-ink">{state.balance.credits ?? '—'} <span className="text-[13px] font-semibold text-ink-muted">{state.balance.credits !== null ? plural(state.balance.credits, CREDIT_FORMS) : ''}</span></div>
              {state.balance.plan && <div className="text-[12px] text-ink-faint">{state.balance.plan}</div>}
            </div>
            <div className="rounded-2xl bg-secondary px-3.5 py-3">
              <div className="text-[12px] font-semibold text-ink-muted">Аккаунт</div>
              <div className="truncate font-semibold text-ink">{state.account.email ?? state.account.name ?? '—'}</div>
              {state.connectedAt && <div className="text-[12px] text-ink-faint">с {formatDateTime(state.connectedAt)}</div>}
            </div>
          </div>
        )}

        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            {connected ? (
              <>
                <Button type="button" size="sm" variant="soft" disabled={actions.busy} onClick={actions.refresh}><RefreshCw /> Обновить</Button>
                <Button type="button" size="sm" variant="soft" disabled={actions.busy} onClick={actions.connect}><LogIn /> Переподключить</Button>
                <Button type="button" size="sm" variant="ghost" disabled={actions.busy} onClick={actions.disconnect}><Power /> Отключить</Button>
              </>
            ) : (
              <Button type="button" size="sm" disabled={actions.busy || !state.canStoreSecrets} onClick={actions.connect}><LogIn /> Подключить</Button>
            )}
          </div>
        ) : !connected && <p className="text-ink-muted">Подключает администратор.</p>}

        {connected && (
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-panel px-3.5 py-3">
            <span>
              <b className="block text-ink">Доступ команды</b>
              <span className="text-[12.5px] text-ink-muted">Открыто инструментов: {openTools} из {state.tools.length}</span>
            </span>
            <Switch checked={state.policy.enabled} disabled={!isAdmin || actions.busy} onCheckedChange={(enabled) => actions.setPolicy({ enabled }, enabled ? 'Команде открыт Higgsfield' : 'Higgsfield закрыт для команды')} />
          </label>
        )}

        {connected && state.tools.length > 0 && (
          <div>
            <button type="button" onClick={() => setToolsOpen(!toolsOpen)} className="flex items-center gap-1 text-[13px] font-semibold text-brand-800">
              Инструменты <ChevronDown className={cn('h-4 w-4 transition', toolsOpen && 'rotate-180')} />
            </button>
            {toolsOpen && (
              <ul className="mt-2 flex max-h-[420px] flex-col divide-y divide-black/[0.05] overflow-y-auto rounded-2xl border border-black/[0.06]">
                {state.tools.map((tool) => (
                  <li key={tool.name} className="flex items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[12.5px] text-ink">{tool.name}</div>
                      <div className={cn('text-[11.5px]', ACCESS[tool.access].className)}>{ACCESS[tool.access].label}</div>
                    </div>
                    <Switch checked={isOpen(tool.access)} disabled={!isAdmin || actions.busy} onCheckedChange={(open) => toggleTool(tool, open)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {state.usage.byPerson.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <b className="text-ink">За неделю</b>
            {state.usage.byPerson.map((row) => (
              <div key={row.userId} className="flex items-center justify-between gap-3">
                <span className="truncate text-ink-soft">{members.get(row.userId)?.name ?? 'участник'}</span>
                <span className="text-[12.5px] text-ink-muted">{pluralize(row.generations, GENERATION_FORMS)} · {pluralize(row.calls, CALL_FORMS)}</span>
              </div>
            ))}
          </div>
        )}

        {state.usage.recent.length > 0 && (
          <div className="flex flex-col gap-1">
            <b className="text-ink">Последние вызовы</b>
            {state.usage.recent.slice(0, RECENT_CALLS).map((call) => (
              <div key={`${call.at}-${call.tool}`} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-24 shrink-0 text-ink-faint">{formatDateTime(call.at)}</span>
                <span className="truncate text-ink-soft">{members.get(call.userId)?.name.split(' ')[0] ?? '—'}</span>
                <span className={cn('truncate font-mono', call.ok ? 'text-ink' : 'text-rose-700')} title={call.error ?? undefined}>{call.tool}{call.model ? ` · ${call.model}` : ''}{call.costOnly ? ' · цена' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
