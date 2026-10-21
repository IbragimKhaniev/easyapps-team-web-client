import { BookOpen, NotebookPen, Puzzle, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConnectorCard } from '../connector/ConnectorCard';
import { ConnectWizard } from './ConnectWizard';
import { KeysCard } from './KeysCard';
import { PluginUpdateBanner } from './PluginUpdateBanner';
import { TeamAgentsCard } from './TeamAgentsCard';

const HOW_IT_WORKS = [
  { icon: Puzzle, text: 'Плагин easyapps-team встраивается в агента: в начале разговора даёт ему ваши задачи и правила команды, на каждый запрос напоминает про журнал.' },
  { icon: NotebookPen, text: 'Работа для easyapps идёт в журнал: агент открывает её над задачей, пишет шаги, результаты с цифрами, плюсы и минусы. Личные проекты — нет.' },
  { icon: RefreshCw, text: 'Трекер обновляется сам: нужна задача — заводится, этап сменился — меняется статус, договорённости и итог — комментариями.' },
  { icon: BookOpen, text: 'Важное оседает в базе знаний по направлениям, и следующая работа по теме сразу получает его.' },
  { icon: Sparkles, text: 'Автожурнал записывает ваши запросы и ответы агента — даже если агент забыл записать сам.' },
  { icon: ShieldCheck, text: 'Пароли, токены и ключи в текстах маскируются до записи. Ключ агента можно отозвать в любой момент.' },
];

/**
 * «Агенты и плагин»: установка плагина одной командой (скрипт сам получает
 * ключ и ставит плагин в Claude Code и Codex), коннектор для приложений Claude
 * (claude.ai, Desktop, Design, Cowork — вход по OAuth), мои ключи и кто в
 * команде уже работает через агента.
 */
export const AgentsPage = () => (
  <div className="animate-fade-up">
    <PageHeader
      title="Агенты и плагин"
      subtitle="Плагин easyapps-team для Claude Code и Codex и коннектор для приложений Claude: агент ведёт журнал, задачи и базу знаний от вашего имени."
      actions={(
        <Button variant="outline" size="sm" asChild>
          <Link to={PATHS.journal}><NotebookPen /> Журнал</Link>
        </Button>
      )}
    />
    <PluginUpdateBanner />
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-12 lg:gap-5 lg:px-0">
      <div className="flex flex-col gap-4 lg:col-span-7 lg:gap-5">
        <ConnectWizard />
        <ConnectorCard />
        <Card title="Как это работает">
          <ul className="flex flex-col gap-3">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-[14px] leading-snug text-ink-soft">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
        <TeamAgentsCard />
        <KeysCard />
      </div>
    </div>
  </div>
);
