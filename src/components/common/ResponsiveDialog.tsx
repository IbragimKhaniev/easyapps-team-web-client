import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface IResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Заголовок виден (иначе — только для экранных чтецов). */
  showTitle?: boolean;
  /** Классы окна на компьютере (ширина, высота). */
  desktopClassName?: string;
  /** Классы шторки на телефоне (высота). */
  mobileClassName?: string;
  children: ReactNode;
}

/**
 * Окно, родное для обоих экранов: на компьютере — диалог по центру, на
 * телефоне — шторка снизу (vaul), как модальные экраны iOS.
 */
export const ResponsiveDialog = ({
  open,
  onOpenChange,
  title,
  description,
  showTitle = false,
  desktopClassName,
  mobileClassName,
  children,
}: IResponsiveDialogProps) => {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('flex flex-col gap-0 p-0', desktopClassName)} showCloseButton={false} aria-describedby={undefined}>
          <DialogTitle className={showTitle ? 'px-6 pt-6 text-[20px] font-bold tracking-tight' : 'sr-only'}>{title}</DialogTitle>
          {description && <DialogDescription className="sr-only">{description}</DialogDescription>}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={mobileClassName} aria-describedby={undefined}>
        <DrawerTitle className={showTitle ? 'px-5 pb-2 pt-1 text-[20px] font-bold tracking-tight' : 'sr-only'}>{title}</DrawerTitle>
        {description && <DrawerDescription className="sr-only">{description}</DrawerDescription>}
        {children}
      </DrawerContent>
    </Drawer>
  );
};
