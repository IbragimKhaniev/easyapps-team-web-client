import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';

import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useTaskParam } from '../hooks/useTaskParam';
import { TaskDetailSkeleton } from './detail/TaskDetailSkeleton';

const PANEL_SPRING = { type: 'spring', stiffness: 420, damping: 40 } as const;

const TaskDetail = lazy(async () => ({ default: (await import('./detail/TaskDetail')).TaskDetail }));

/**
 * Содержимое карточки — отдельным чанком: в нём markdown (~160 КБ), на старте он
 * не нужен. Пока чанк грузится, на месте карточки её заготовка.
 */
const TaskContent = ({ taskKey, onClose }: { taskKey: string; onClose: () => void }) => (
  <Suspense fallback={<TaskDetailSkeleton />}>
    <TaskDetail key={taskKey} taskKey={taskKey} onClose={onClose} />
  </Suspense>
);

/**
 * Карточка задачи поверх любого экрана по `?task=EA-42`. Компьютер — панель
 * справа (список виден слева), телефон — шторка почти во весь экран. Оболочка
 * (панель, шторка, Esc) в стартовом коде — иначе пропала бы анимация закрытия;
 * лениво только содержимое.
 */
export const TaskSheet = () => {
  const { openKey, closeTask } = useTaskParam();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!openKey || !isDesktop) return;
    const onKey = (event: KeyboardEvent) => {
      // Esc закрывает панель, только если поверх неё не открыт выбор или диалог.
      const overlayOpen = document.querySelector('[data-radix-popper-content-wrapper], [role="dialog"]:not([data-task-panel])');
      if (event.key === 'Escape' && !overlayOpen) closeTask();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openKey, isDesktop, closeTask]);

  if (isDesktop) {
    return (
      <AnimatePresence>
        {openKey && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/[0.08]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTask}
            />
            <motion.aside
              key="panel"
              className="fixed bottom-4 right-4 top-4 z-50 w-[min(620px,calc(100vw-2rem))] overflow-y-auto rounded-card bg-white shadow-float"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={PANEL_SPRING}
              role="dialog"
              aria-label="Задача"
              data-task-panel
            >
              <TaskContent taskKey={openKey} onClose={closeTask} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <Drawer open={Boolean(openKey)} onOpenChange={(open) => !open && closeTask()}>
      <DrawerContent className="h-[94dvh]">
        <DrawerTitle className="sr-only">Задача</DrawerTitle>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {openKey && <TaskContent taskKey={openKey} onClose={closeTask} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
