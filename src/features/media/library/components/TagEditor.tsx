import { X } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

import { cn } from '@/lib/utils';

interface ITagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Метки медиатеки — подсказки при вводе. */
  suggestions?: string[];
  disabled?: boolean;
}

const TAG_MAX = 40;
const TAGS_MAX = 20;

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, TAG_MAX);

/** Метки файла: Enter или запятая — добавить, Backspace на пустом — убрать последнюю. */
export const TagEditor = ({ tags, onChange, suggestions = [], disabled }: ITagEditorProps) => {
  const [value, setValue] = useState('');
  const matching = value
    ? suggestions.filter((tag) => tag.includes(normalize(value)) && !tags.includes(tag)).slice(0, 6)
    : [];

  const add = (raw: string) => {
    const tag = normalize(raw);
    if (!tag || tags.includes(tag) || tags.length >= TAGS_MAX) return;
    onChange([...tags, tag]);
    setValue('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(value);
    } else if (event.key === 'Backspace' && !value && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={cn('flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl bg-secondary px-2 py-1.5', disabled && 'opacity-60')}>
        {tags.map((tag) => (
          <span key={tag} className="inline-flex h-7 items-center gap-1 rounded-full bg-white pl-2.5 pr-1 text-[13px] font-semibold text-ink shadow-card">
            {tag}
            {!disabled && (
              <button type="button" onClick={() => onChange(tags.filter((item) => item !== tag))} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:bg-black/[0.06] hover:text-ink" aria-label={`Убрать метку ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => value && add(value)}
          disabled={disabled}
          placeholder={tags.length ? '' : 'Метки: кейсы, осень, баннеры'}
          className="h-7 min-w-[120px] flex-1 bg-transparent px-1.5 text-[14px] outline-none placeholder:text-ink-faint"
        />
      </div>
      {matching.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matching.map((tag) => (
            <button key={tag} type="button" onClick={() => add(tag)} className="h-7 rounded-full border border-dashed border-brand-300 px-2.5 text-[12.5px] font-semibold text-brand-800 hover:bg-brand-50">
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
