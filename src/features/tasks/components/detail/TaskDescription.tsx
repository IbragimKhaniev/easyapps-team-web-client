import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Markdown } from '@/components/common/Markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';

interface ITaskDescriptionProps {
  value: string;
  onSave: (description: string) => void;
}

/** Описание: читается как текст (markdown), правится по «Изменить» — ⌘Enter сохраняет. */
export const TaskDescription = ({ value, onSave }: ITaskDescriptionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, draft);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const save = () => {
    if (draft !== value) onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          ref={ref}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) save();
            if (event.key === 'Escape') setEditing(false);
          }}
          placeholder="Что нужно сделать, ссылки, критерии готовности… Поддерживается markdown."
          className="min-h-[140px] resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Отмена
          </Button>
          <Button size="sm" onClick={save}>
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  if (!value.trim()) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full rounded-2xl border border-dashed border-black/10 px-4 py-5 text-left text-[14px] text-ink-faint transition-colors hover:border-brand/40 hover:text-ink-muted"
      >
        Добавить описание…
      </button>
    );
  }

  return (
    <div className="group relative rounded-2xl px-1">
      <Markdown>{value}</Markdown>
      <Button
        variant="white"
        size="icon-sm"
        onClick={() => setEditing(true)}
        className="absolute right-0 top-0 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        aria-label="Изменить описание"
      >
        <Pencil />
      </Button>
    </div>
  );
};
