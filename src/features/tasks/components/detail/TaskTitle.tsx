import { useEffect, useRef, useState } from 'react';

import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';

interface ITaskTitleProps {
  value: string;
  onSave: (title: string) => void;
}

/** Название правится на месте: Enter или уход из поля — сохранить, Esc — отменить. */
export const TaskTitle = ({ value, onSave }: ITaskTitleProps) => {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, draft);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const title = draft.trim();
    if (!title) setDraft(value);
    else if (title !== value) onSave(title);
  };

  return (
    <textarea
      ref={ref}
      value={draft}
      rows={1}
      maxLength={300}
      onChange={(event) => setDraft(event.target.value.replace(/\n/g, ' '))}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
      className="w-full resize-none overflow-hidden rounded-xl bg-transparent text-[22px] font-extrabold leading-tight tracking-tight text-ink outline-none transition-colors focus:bg-secondary/70 md:text-[26px]"
      aria-label="Название задачи"
    />
  );
};
