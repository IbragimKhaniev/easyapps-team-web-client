import { Send } from 'lucide-react';
import { useState } from 'react';

import { useListPipelineEvents } from '@/api/generated/pipeline/pipeline';
import type { TeamMember } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EventFeed } from '../components/EventFeed';
import type { TPipelineActions } from '../hooks/usePipelineActions';

interface ILogTabProps {
  project: string;
  actions: TPipelineActions;
  members: Map<string, TeamMember>;
  onOpenRef: (kind: string, key: string) => void;
}

const LOG_LIMIT = 200;

/** Журнал конвейера: что и кто сделал. Запись людей отсюда — агент увидит её в своей сводке. */
export const LogTab = ({ project, actions, members, onOpenRef }: ILogTabProps) => {
  const { data, isLoading } = useListPipelineEvents(project, { limit: LOG_LIMIT }, { query: { refetchInterval: 20_000 } });
  const [text, setText] = useState('');

  const send = async () => {
    if (!text.trim()) return;
    if (await actions.addNote(text.trim())) setText('');
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="Написать в журнал">
        <div className="flex flex-col gap-2">
          <Textarea rows={2} value={text} onChange={(event) => setText(event.target.value)} placeholder="Например: «Зашёл Михалыч — делаем его серию из пяти скетчей»" />
          <div><Button type="button" size="sm" disabled={actions.busy || !text.trim()} onClick={send}><Send /> Записать</Button></div>
        </div>
      </Card>
      <Card title="Журнал">
        {isLoading ? <div className="skeleton h-40 rounded-xl" /> : <EventFeed events={data?.data ?? []} members={members} onOpenRef={onOpenRef} byDay />}
      </Card>
    </div>
  );
};
