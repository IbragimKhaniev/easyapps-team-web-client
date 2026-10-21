import { useState, type ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface IConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** Кнопка подтверждения: «Удалить насовсем». */
  confirmLabel: string;
  /** Действие; вернуло `false` — окно остаётся открытым (ошибку уже показали). */
  onConfirm: () => Promise<boolean | void>;
  /** Под описанием: галочки, что уйдёт вместе. */
  children?: ReactNode;
}

/**
 * Подтверждение необратимого действия: красная кнопка, пока действие идёт —
 * кнопки заблокированы и окно не закрывается. Окно рендерится порталом, но
 * события React всплывают по дереву компонентов: не кладите его внутрь
 * кликабельной карточки — клик в окне откроет и её.
 */
export const ConfirmDialog = ({ open, onOpenChange, title, description, confirmLabel, onConfirm, children }: IConfirmDialogProps) => {
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      if ((await onConfirm()) !== false) onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[19px] font-bold tracking-tight text-ink">{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-[14px] leading-relaxed text-ink-muted">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              // Окно закрываем сами, когда действие удалось, — не по клику.
              event.preventDefault();
              void confirm();
            }}
          >
            {pending ? 'Удаляем…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
