import { Bold, Code, Italic, Link2 } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';
import { cn } from '@/lib/utils';
import { insertLink, wrapSelection, type IMarkupEdit } from '../../lib/markup';

interface ITextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Под полем: счётчики площадок. */
  footer?: React.ReactNode;
  className?: string;
}

const URL_PATTERN = /^https?:\/\/\S+$/i;

/**
 * Текст поста с разметкой, которую понимают площадки: **жирный**, __курсив__,
 * [ссылка](адрес), `код`. Кнопки оборачивают выделение; ⌘B / ⌘I — как в
 * любом редакторе.
 */
export const TextEditor = ({ value, onChange, placeholder, disabled, footer, className }: ITextEditorProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('https://');
  useAutosizeTextarea(ref, value);

  const apply = (edit: (current: string, start: number, end: number) => IMarkupEdit) => {
    const element = ref.current;
    if (!element) return;
    const next = edit(element.value, element.selectionStart, element.selectionEnd);
    onChange(next.value);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  const wrap = (marker: string) => apply((current, start, end) => wrapSelection(current, start, end, marker));

  const addLink = () => {
    if (!URL_PATTERN.test(url.trim())) return;
    apply((current, start, end) => insertLink(current, start, end, url.trim()));
    setLinkOpen(false);
    setUrl('https://');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key === 'b') {
      event.preventDefault();
      wrap('**');
    } else if (event.key === 'i') {
      event.preventDefault();
      wrap('__');
    }
  };

  const tool = 'h-8 w-8 rounded-lg text-ink-muted hover:bg-black/[0.05] hover:text-ink';

  return (
    <div className={cn('rounded-2xl border border-input bg-white transition-shadow focus-within:border-brand-300 focus-within:shadow-[0_0_0_4px_rgba(60,193,246,0.15)]', className)}>
      <div className="flex items-center gap-0.5 border-b border-black/[0.05] px-2 py-1.5">
        <Button type="button" variant="ghost" size="icon-sm" className={tool} onClick={() => wrap('**')} title="Жирный (⌘B)" disabled={disabled}>
          <Bold />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" className={tool} onClick={() => wrap('__')} title="Курсив (⌘I)" disabled={disabled}>
          <Italic />
        </Button>
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" className={tool} title="Ссылка" disabled={disabled}>
              <Link2 />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 rounded-2xl p-3 shadow-float">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                addLink();
              }}
            >
              <Input autoFocus value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
              <Button type="submit" size="md" disabled={!URL_PATTERN.test(url.trim())}>
                Вставить
              </Button>
            </form>
            <p className="mt-2 text-xs text-ink-muted">Выделенный текст станет подписью ссылки. VK и Instagram покажут адрес рядом.</p>
          </PopoverContent>
        </Popover>
        <Button type="button" variant="ghost" size="icon-sm" className={tool} onClick={() => wrap('`')} title="Код" disabled={disabled}>
          <Code />
        </Button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={5}
        className="block min-h-[148px] w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-faint disabled:opacity-60"
      />
      {footer && <div className="border-t border-black/[0.05] px-3 py-2">{footer}</div>}
    </div>
  );
};
