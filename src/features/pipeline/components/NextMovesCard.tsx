import { Bot, Pencil, Plus, Save, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { PipelineActor, type PipelineNextMove } from '@/api/models';
import { Card } from '@/components/common/Card';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { TPipelineActions } from '../hooks/usePipelineActions';

interface INextMovesCardProps {
  moves: PipelineNextMove[];
  actions: TPipelineActions;
}

const PANELS: Array<{ who: PipelineActor; title: string; empty: string; icon: typeof Users }> = [
  { who: PipelineActor.people, title: 'Ход людей', empty: 'От людей сейчас ничего не нужно.', icon: Users },
  { who: PipelineActor.agent, title: 'Ход агента', empty: 'Задач у агента нет.', icon: Bot },
];

/** «Ваш ход / ход агента» — что сейчас ждут от людей и что делает агент. Правят и люди, и агент. */
export const NextMovesCard = ({ moves, actions }: INextMovesCardProps) => {
  const [draft, setDraft] = useState<PipelineNextMove[] | null>(null);

  const save = async () => {
    if (!draft) return;
    const clean = draft.map((move) => ({ ...move, text: move.text.trim() })).filter((move) => move.text);
    if (await actions.setNextMoves(clean)) setDraft(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PANELS.map((panel) => {
          const list = moves.filter((move) => move.who === panel.who);
          return (
            <Card
              key={panel.who}
              title={<span className="inline-flex items-center gap-2"><panel.icon className="h-4 w-4 text-brand-700" />{panel.title}</span>}
              action={panel.who === PipelineActor.people && (
                <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(moves.map((move) => ({ ...move })))}><Pencil /> Править</Button>
              )}
            >
              {list.length
                ? <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] text-ink-soft">{list.map((move) => <li key={move.text}>{move.text}</li>)}</ul>
                : <p className="text-[14px] text-ink-faint">{panel.empty}</p>}
            </Card>
          );
        })}
      </div>

      <ResponsiveDialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)} title="Ходы" showTitle desktopClassName="max-w-[620px]" mobileClassName="h-[80dvh]">
        {draft && (
          <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-2 lg:px-6">
            {PANELS.map((panel) => (
              <section key={panel.who} className="flex flex-col gap-2">
                <b className="text-[15px] text-ink">{panel.title}</b>
                {draft.map((move, index) => move.who === panel.who && (
                  <div key={index} className="flex items-start gap-2">
                    <Textarea rows={2} value={move.text} onChange={(event) => setDraft(draft.map((item, at) => (at === index ? { ...item, text: event.target.value } : item)))} />
                    <Button type="button" size="icon" variant="ghost" aria-label="Убрать" onClick={() => setDraft(draft.filter((_, at) => at !== index))}><Trash2 /></Button>
                  </div>
                ))}
                <div><Button type="button" size="sm" variant="outline" onClick={() => setDraft([...draft, { who: panel.who, text: '' }])}><Plus /> Добавить</Button></div>
              </section>
            ))}
            <div><Button type="button" disabled={actions.busy} onClick={save}><Save /> Сохранить</Button></div>
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
};
