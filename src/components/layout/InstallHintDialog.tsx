import { PlusSquare, Share } from 'lucide-react';
import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const STEPS = [
  { icon: null, text: 'Откройте team.easyapps.click в Safari на iPhone' },
  { icon: Share, text: 'Нажмите «Поделиться» внизу экрана' },
  { icon: PlusSquare, text: 'Выберите «На экран Домой» и «Добавить»' },
] as const;

/** Как поставить team на iPhone: PWA открывается без адресной строки, как приложение. */
export const InstallHintDialog = ({ trigger }: { trigger: ReactNode }) => (
  <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="max-w-sm">
      <DialogTitle className="text-xl font-bold">team на iPhone</DialogTitle>
      <DialogDescription className="text-ink-muted">
        Три шага — и на экране «Домой» появится иконка. Открывается во весь экран, вход сохраняется.
      </DialogDescription>
      <ol className="mt-1 flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step.text} className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-800 shadow-card">
              {step.icon ? <step.icon className="h-4 w-4" /> : index + 1}
            </span>
            <span className="text-sm font-medium text-ink">{step.text}</span>
          </li>
        ))}
      </ol>
    </DialogContent>
  </Dialog>
);
