import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';

import { useGetAgentConnector } from '@/api/generated/agents/agents';
import { Card } from '@/components/common/Card';
import { CopyBlock } from '../components/CopyBlock';

/** Где в Claude добавляют свои коннекторы. */
const CLAUDE_CONNECTORS_URL = 'https://claude.ai/customize/connectors';

const Step = ({ index, children }: { index: number; children: ReactNode }) => (
  <li className="flex items-start gap-3 text-[14px] leading-snug text-ink-soft">
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[12.5px] font-bold text-brand-800">
      {index}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
  </li>
);

/**
 * Коннектор easyapps team для приложений Claude — claude.ai, Desktop, Design,
 * Cowork. Плагин с ключом из файла там не работает: MCP подключается по
 * адресу, а вход — по OAuth через этот сайт (страница согласия
 * `ConnectorConsentPage`). Коннектор добавляется один раз на аккаунт Claude.
 */
export const ConnectorCard = () => {
  const { data, isLoading } = useGetAgentConnector();
  const connector = data?.data;

  return (
    <Card title="Claude на сайте, в Design и Cowork">
      <p className="text-[14px] leading-relaxed text-ink-soft">
        Команда выше ставит плагин в Claude Code и Codex. В приложениях Claude — claude.ai, Claude Desktop, Claude Design и Cowork —
        easyapps team подключается коннектором: один раз на аккаунт Claude, дальше он есть в каждом из них.
      </p>
      <ol className="mt-4 flex flex-col gap-3.5">
        <Step index={1}>
          <span>
            В Claude откройте <b>Customize → Connectors</b> и нажмите <b>Add custom connector</b>.
          </span>
          <a
            href={CLAUDE_CONNECTORS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-semibold text-brand-800 hover:underline"
          >
            Открыть коннекторы Claude <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Step>
        <Step index={2}>
          <span>
            Название — <b>{connector?.name ?? 'easyapps team'}</b>, адрес сервера — ровно этот:
          </span>
          {isLoading || !connector
            ? <div className="skeleton h-[84px] rounded-2xl" />
            : <CopyBlock caption="Адрес сервера" text={connector.url} done="Адрес скопирован — вставьте его в Claude" />}
        </Step>
        <Step index={3}>
          <span>
            Нажмите <b>Connect</b>: откроется team.easyapps.click — войдите, если попросит, и нажмите <b>«Разрешить»</b>.
          </span>
        </Step>
        <Step index={4}>
          <span>
            В новом чате проверьте, что коннектор easyapps team включён, и напишите <b>«проверь easyapps team»</b>.
          </span>
        </Step>
      </ol>
      <p className="mt-4 text-[12.5px] leading-snug text-ink-faint">
        Подключение появится в «Моих ключах» с меткой «коннектор Claude» — отозвать можно там или в настройках Claude. Автожурнала в
        приложениях Claude нет: важное агент пишет в журнал сам. В Team и Enterprise коннектор сначала добавляет владелец организации.
      </p>
    </Card>
  );
};
