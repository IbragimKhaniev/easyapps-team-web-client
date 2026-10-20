import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

const COPIED_MS = 1600;

interface ICopyButtonProps {
  text: string;
  label: string;
  done?: string;
}

/** Скопировать текст (промпт) — с отметкой «скопировано» на кнопке. */
export const CopyButton = ({ text, label, done = 'Скопировано' }: ICopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(done);
      window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      toast.error('Браузер не дал скопировать — выделите текст вручную');
    }
  };
  return (
    <Button type="button" size="sm" variant="outline" onClick={copy}>
      {copied ? <Check /> : <Copy />} {label}
    </Button>
  );
};
