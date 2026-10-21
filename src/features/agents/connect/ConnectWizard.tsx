import { Check, ChevronDown, CircleCheck, CircleX, Copy, Loader2, MessageSquareText, RotateCcw, Terminal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useGetAgentInstall, useListAgentKeys, useStartAgentInstall } from '@/api/generated/agents/agents';
import { AgentInstallStatus, type AgentInstallStart } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { apiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { AGENT_TITLES } from '../lib/journalMeta';

/** Пока ждём запуска команды и подключения агента — состояние перечитывается так часто. */
const WAIT_REFRESH_MS = 3_000;

type TRowState = 'done' | 'waiting' | 'idle' | 'failed';

const StatusRow = ({ state, children }: { state: TRowState; children: React.ReactNode }) => (
  <li className={cn('flex items-start gap-2.5 text-[14px] leading-snug', state === 'done' ? 'font-semibold text-ink' : state === 'failed' ? 'text-rose-700' : 'text-ink-muted')}>
    {state === 'done' && <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />}
    {state === 'waiting' && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-700" />}
    {state === 'failed' && <CircleX className="h-5 w-5 shrink-0 text-rose-600" />}
    {state === 'idle' && <span className="h-5 w-5 shrink-0 rounded-full border-2 border-black/10" />}
    <span>{children}</span>
  </li>
);

interface ICopyBlockProps {
  /** Подпись в шапке плашки: «Терминал», «Сообщение агенту». */
  caption: string;
  text: string;
  done: string;
  multiline?: boolean;
}

/** Текст в тёмной плашке; «Скопировать» — в шапке, чтобы не закрывать текст в узкой колонке. */
const CopyBlock = ({ caption, text, done, multiline = false }: ICopyBlockProps) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(done);
  };
  return (
    <div className="overflow-hidden rounded-2xl bg-ink">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 py-2 pl-4 pr-2">
        <span className="text-[12px] font-semibold text-white/50">{caption}</span>
        <Button variant="white" size="sm" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />} {copied ? 'Скопировано' : 'Скопировать'}
        </Button>
      </div>
      <pre className={cn(
        'overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-white/90',
        multiline ? 'max-h-[220px] whitespace-pre-wrap' : 'whitespace-pre-wrap break-all',
      )}
      >
        {text}
      </pre>
    </div>
  );
};

/**
 * Мастер подключения: одна команда в Терминале. Скрипт на компьютере сам
 * меняет одноразовый код на ключ агента и ставит плагин easyapps-team в Claude
 * Code и Codex — ключ не показывается и не уходит в переписку. Дальше мастер
 * видит, на какой компьютер встал плагин, подключился ли агент и идёт ли
 * автожурнал. Команда выдаётся только по кнопке.
 */
export const ConnectWizard = () => {
  const start = useStartAgentInstall();
  const [started, setStarted] = useState<AgentInstallStart | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);

  const { data: installData } = useGetAgentInstall(started?.install.id ?? '', {
    query: {
      enabled: Boolean(started),
      refetchInterval: (query) => (query.state.data?.data.status === AgentInstallStatus.pending ? WAIT_REFRESH_MS : false),
    },
  });
  const install = installData?.data ?? started?.install ?? null;
  const claimed = install?.status === AgentInstallStatus.claimed;
  const expired = install?.status === AgentInstallStatus.expired;

  const { data: keys } = useListAgentKeys({
    query: { refetchInterval: (query) => (claimed && !query.state.data?.data.find((key) => key.id === install?.keyId)?.hooksSeenAt ? WAIT_REFRESH_MS : false) },
  });
  const key = claimed ? keys?.data.find((item) => item.id === install?.keyId) : undefined;
  const connected = Boolean(key?.lastClient);
  const hooks = Boolean(key?.hooksSeenAt);
  const agents = install?.agents.map((agent) => AGENT_TITLES[agent]).join(' и ');

  const begin = async () => {
    try {
      const result = await start.mutateAsync();
      setStarted(result.data);
      setPromptOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось выдать команду установки'));
    }
  };

  if (!started) {
    return (
      <Card title="Подключить компьютер">
        <p className="text-[14px] leading-relaxed text-ink-soft">
          Одна команда в Терминале — и у Claude Code и Codex на этом компьютере появится плагин easyapps-team: сервер команды,
          скиллы, команды /easyapps-team:… и автожурнал. В каждом разговоре агент получит ваши задачи и правила из базы знаний,
          работа для easyapps пойдёт в журнал. Ключ агента скрипт получит и сохранит сам — копировать его не нужно.
        </p>
        <Button className="mt-4" size="lg" disabled={start.isPending} onClick={() => void begin()}>
          {start.isPending ? <Loader2 className="animate-spin" /> : <Terminal />} Показать команду установки
        </Button>
        <p className="mt-3 text-[12.5px] text-ink-faint">macOS и Linux. Повторный запуск безопасен — так же плагин и обновляется.</p>
      </Card>
    );
  }

  return (
    <Card
      title="Установка одной командой"
      action={(
        <Button variant="ghost" size="sm" disabled={start.isPending} onClick={() => void begin()}>
          <RotateCcw /> Новая команда
        </Button>
      )}
    >
      <p className="mb-3 text-[14px] leading-snug text-ink-soft">
        Откройте Терминал (на Mac: <b>⌘ Пробел</b> → «Терминал»), вставьте команду и нажмите <b>Enter</b>:
      </p>
      <CopyBlock caption="Терминал" text={started.command} done="Команда скопирована — вставьте её в Терминал" />
      <p className="mt-2 text-[12.5px] leading-snug text-ink-faint">
        Команда одноразовая и действует 30 минут: в ней код, который скрипт сам обменяет на ваш ключ. Ключ не покажется ни здесь, ни в Терминале.
      </p>

      <ul className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-secondary p-4">
        <StatusRow state={claimed ? 'done' : expired ? 'failed' : 'waiting'}>
          {claimed
            ? `Плагин на компьютере${install?.host ? ` «${install.host}»` : ''}${agents ? ` — для ${agents}` : ' — агентов скрипт не нашёл: поставьте Claude Code или Codex и запустите обновление'}`
            : expired ? 'Команда устарела — нажмите «Новая команда»' : 'Ждём, когда команда запустится на компьютере…'}
        </StatusRow>
        <StatusRow state={connected ? 'done' : claimed ? 'waiting' : 'idle'}>
          {connected ? `Агент подключился: ${key?.lastClient}` : 'Откройте новый чат в Claude Code или Codex и напишите «проверь easyapps team»'}
        </StatusRow>
        <StatusRow state={hooks ? 'done' : connected ? 'waiting' : 'idle'}>
          {hooks ? 'Автожурнал работает: запросы и ответы попадают в журнал' : 'Автожурнал включится после первого запроса агенту'}
        </StatusRow>
      </ul>

      <button
        type="button"
        onClick={() => setPromptOpen(!promptOpen)}
        className="mt-4 flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-800"
        aria-expanded={promptOpen}
      >
        <MessageSquareText className="h-4 w-4" /> Нет под рукой терминала? Попросите агента
        <ChevronDown className={cn('h-4 w-4 transition', promptOpen && 'rotate-180')} />
      </button>
      {promptOpen && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-[13px] leading-snug text-ink-muted">
            Отправьте это Claude Code или Codex — агент выполнит ту же команду сам. Ключа в тексте нет. Если у агента нет сети или
            доступа к домашней папке (так бывает в облачных средах), он скажет об этом — тогда запустите команду в Терминале.
          </p>
          <CopyBlock caption="Сообщение агенту" text={started.agentPrompt} done="Текст скопирован — отправьте его агенту" multiline />
        </div>
      )}

      <p className="mt-4 text-[12.5px] leading-snug text-ink-faint">
        Обновить плагин потом — та же команда без кода: <code className="break-all rounded bg-secondary px-1 py-0.5 text-ink-soft">{started.updateCommand}</code>,
        или скажите агенту «обнови плагин easyapps team».
      </p>
    </Card>
  );
};
