import { Check, Plus, X } from 'lucide-react';
import { useState } from 'react';

import type { ChecklistItem, ChecklistItemInput } from '@/api/models';
import { cn } from '@/lib/utils';

interface ITaskChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItemInput[]) => void;
}

const toInput = (items: ChecklistItem[]): ChecklistItemInput[] =>
  items.map((item) => ({ id: item.id, text: item.text, done: item.done }));

/** Чек-лист: прогресс, отметка по нажатию, новый пункт — Enter. */
export const TaskChecklist = ({ items, onChange }: ITaskChecklistProps) => {
  const [draft, setDraft] = useState('');
  const done = items.filter((item) => item.done).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  const toggle = (id: string) =>
    onChange(toInput(items).map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const remove = (id: string) => onChange(toInput(items).filter((item) => item.id !== id));

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...toInput(items), { text, done: false }]);
    setDraft('');
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-brand-700 transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[12.5px] font-bold text-ink-muted tabular">
            {done}/{items.length}
          </span>
        </div>
      )}

      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="group flex min-h-10 items-center gap-3 rounded-xl px-1 hover:bg-secondary/70">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                'inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                item.done ? 'border-brand-700 bg-brand-700 text-white' : 'border-ink-faint/70 bg-white',
              )}
              aria-label={item.done ? 'Снять отметку' : 'Отметить'}
            >
              {item.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </button>
            <span className={cn('flex-1 text-[14.5px]', item.done ? 'text-ink-faint line-through' : 'text-ink')}>{item.text}</span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint opacity-100 hover:bg-white hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Удалить пункт"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <form
        className="flex items-center gap-2 rounded-xl px-1"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <Plus className="h-5 w-5 shrink-0 text-ink-faint" />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Добавить пункт"
          maxLength={500}
          enterKeyHint="done"
          className="h-10 flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
        />
      </form>
    </div>
  );
};
