import { useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

interface IDropZoneProps {
  accept: string;
  /** Подходит ли файл; нет — тост с этим текстом. */
  check: (file: File) => boolean;
  wrongFile: string;
  onFile: (file: File) => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** Перетащите файл или нажмите — выбор с компьютера или телефона. */
export const DropZone = ({ accept, check, wrongFile, onFile, disabled, className, children }: IDropZoneProps) => {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = (file: File | undefined) => {
    if (!file || disabled) return;
    if (!check(file)) {
      toast.error(wrongFile);
      return;
    }
    onFile(file);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => input.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        take(event.dataTransfer.files[0]);
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-black/[0.08] px-4 py-5 text-center text-[13px] text-ink-muted transition-colors hover:border-brand-300 hover:bg-brand-50/50 disabled:opacity-60',
        over && 'border-brand-400 bg-brand-50',
        className,
      )}
    >
      {children}
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          take(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </button>
  );
};
