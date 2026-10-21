import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ICopyBlockProps {
  /** Подпись в шапке плашки: «Терминал», «Сообщение агенту», «Адрес сервера». */
  caption: string;
  text: string;
  /** Тост после копирования: что делать с текстом дальше. */
  done: string;
  multiline?: boolean;
}

/** Текст в тёмной плашке; «Скопировать» — в шапке, чтобы не закрывать текст в узкой колонке. */
export const CopyBlock = ({ caption, text, done, multiline = false }: ICopyBlockProps) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(done);
  };
  return (
    <div className="overflow-hidden rounded-2xl bg-ink">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 py-2 pl-4 pr-2">
        <span className="text-[12px] font-semibold text-white/50">{caption}</span>
        <Button variant="white" size="sm" onClick={() => void copy()}>
          {copied ? <Check /> : <Copy />} {copied ? 'Скопировано' : 'Скопировать'}
        </Button>
      </div>
      <pre className={cn(
        'overflow-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-white/90',
        multiline ? 'max-h-[220px] whitespace-pre-wrap' : 'whitespace-pre-wrap break-all',
      )}
      >
        {text}
      </pre>
    </div>
  );
};
