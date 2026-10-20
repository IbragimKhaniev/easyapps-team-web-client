import { useQueryClient } from '@tanstack/react-query';
import { Bot, Check, CircleCheck, Copy, KeyRound, Loader2, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { getListAgentKeysQueryKey, useCreateAgentKey, useListAgentKeys } from '@/api/generated/agents/agents';
import { ConnectableAgentClient, type CreatedAgentKey } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';

/** Пока ждём подключения — список ключей перечитывается так часто. */
const WAIT_REFRESH_MS = 4_000;

const AGENTS: Array<{ value: ConnectableAgentClient; title: string; hint: string; icon: typeof Bot }> = [
  { value: ConnectableAgentClient['claude-code'], title: 'Claude Code', hint: 'Приложение Claude (вкладка Code) или терминал', icon: Bot },
  { value: ConnectableAgentClient.codex, title: 'Codex', hint: 'Приложение Codex или терминал', icon: Terminal },
];

const StatusRow = ({ done, waiting, children }: { done: boolean; waiting: boolean; children: React.ReactNode }) => (
  <li className={cn('flex items-center gap-2.5 text-[14px]', done ? 'font-semibold text-ink' : 'text-ink-muted')}>
    {done ? <CircleCheck className="h-5 w-5 text-emerald-600" /> : waiting ? <Loader2 className="h-5 w-5 animate-spin text-brand-700" /> : <span className="h-5 w-5 rounded-full border-2 border-black/10" />}
    {children}
  </li>
);

/**
 * Мастер подключения: выбрать агента → получить промт (в нём личный ключ) →
 * отправить его агенту → увидеть «Подключено» и «Автожурнал работает». Ключ
 * создаётся только по кнопке: открыть страницу — не значит выпустить ключ.
 */
export const ConnectWizard = () => {
  const queryClient = useQueryClient();
  const [agent, setAgent] = useState<ConnectableAgentClient | null>(null);
  const [created, setCreated] = useState<CreatedAgentKey | null>(null);
  const [copied, setCopied] = useState(false);
  const createKey = useCreateAgentKey();

  const waiting = Boolean(created);
  const { data: keys } = useListAgentKeys({ query: { refetchInterval: waiting ? WAIT_REFRESH_MS : false } });
  const current = created ? keys?.data.find((key) => key.id === created.key.id) ?? created.key : null;
  const connected = Boolean(current?.lastClient);
  const hooks = Boolean(current?.hooksSeenAt);

  const create = async () => {
    if (!agent) return;
    try {
      const result = await createKey.mutateAsync({ data: { client: agent } });
      setCreated(result.data);
      setCopied(false);
      await queryClient.invalidateQueries({ queryKey: getListAgentKeysQueryKey() });
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось выпустить ключ'));
    }
  };

  const copy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.connect.prompt);
    setCopied(true);
    toast.success('Промт скопирован — отправьте его агенту');
  };

  if (!created) {
    return (
      <Card title="Какой у вас агент?">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {AGENTS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAgent(item.value)}
              aria-pressed={agent === item.value}
              className={cn(
                'relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                agent === item.value ? 'border-brand-300 bg-brand-50/70 shadow-card' : 'border-black/[0.07] hover:border-black/15',
              )}
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold text-ink">{item.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{item.hint}</span>
              </span>
              {agent === item.value && (
                <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
          Агент сам поставит плагин easyapps-team: сервер команды, скиллы, команды /easyapps-team:… и хуки. В каждом разговоре
          у агента будут ваши задачи и правила из базы знаний, работа для easyapps пойдёт в журнал, задачи обновятся по ходу,
          а выводы осядут в базе знаний.
        </p>
        <Button className="mt-4" size="lg" disabled={!agent || createKey.isPending} onClick={() => void create()}>
          {createKey.isPending ? <Loader2 className="animate-spin" /> : <KeyRound />} Показать промт подключения
        </Button>
      </Card>
    );
  }

  return (
    <Card
      title={`Подключение ${AGENTS.find((item) => item.value === created.connect.client)?.title ?? ''}`}
      action={(
        <Button variant="ghost" size="sm" onClick={() => setCreated(null)}>
          <RotateCcw /> Другой агент
        </Button>
      )}
    >
      <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        В промте ваш личный ключ ({created.key.hint}). Не пересылайте его и не публикуйте — по нему агент действует от вашего имени.
      </div>

      <div className="relative mt-4">
        <pre className="max-h-[340px] overflow-auto whitespace-pre-wrap rounded-2xl bg-ink p-4 pr-28 font-mono text-[12px] leading-relaxed text-white/90">
          {created.connect.prompt}
        </pre>
        <Button variant="white" size="sm" className="absolute right-3 top-3" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />} {copied ? 'Скопировано' : 'Скопировать'}
        </Button>
      </div>

      <ol className="mt-4 flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-snug text-ink-soft">
        {created.connect.afterSteps.map((step) => <li key={step}>{step}</li>)}
      </ol>

      <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-secondary p-4">
        <StatusRow done={connected} waiting={!connected}>
          {connected ? `Подключено: ${current?.lastClient}` : 'Ждём, когда агент подключится к серверу команды…'}
        </StatusRow>
        <StatusRow done={hooks} waiting={connected && !hooks}>
          {hooks ? 'Автожурнал работает: запросы и ответы попадают в журнал' : 'Автожурнал включится после первого запроса агенту'}
        </StatusRow>
      </ul>
    </Card>
  );
};
