import { NotebookPen, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConnectWizard } from './ConnectWizard';
import { KeysCard } from './KeysCard';
import { TeamAgentsCard } from './TeamAgentsCard';

const HOW_IT_WORKS = [
  { icon: NotebookPen, text: 'Каждая работа идёт в журнал: агент открывает её над задачей, пишет шаги, результаты с цифрами, плюсы и минусы.' },
  { icon: RefreshCw, text: 'Задача обновляется сама: «В работе» на старте, итог — комментарием, вопросы людям — в задачу.' },
  { icon: Sparkles, text: 'Автожурнал записывает ваши запросы и ответы агента — даже если агент забыл записать сам.' },
  { icon: ShieldCheck, text: 'Пароли, токены и ключи в текстах маскируются до записи. Ключ агента можно отозвать в любой момент.' },
];

/**
 * «Подключить агента»: мастер (агент → промт с ключом → проверка), мои ключи и
 * кто в команде уже работает через агента.
 */
export const AgentsPage = () => (
  <div className="animate-fade-up">
    <PageHeader
      title="Подключить агента"
      subtitle="Claude Code или Codex работают с задачами, контент-планом и журналом от вашего имени."
      actions={(
        <Button variant="outline" size="sm" asChild>
          <Link to={PATHS.journal}><NotebookPen /> Журнал</Link>
        </Button>
      )}
    />
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-12 lg:gap-5 lg:px-0">
      <div className="flex flex-col gap-4 lg:col-span-7 lg:gap-5">
        <ConnectWizard />
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
