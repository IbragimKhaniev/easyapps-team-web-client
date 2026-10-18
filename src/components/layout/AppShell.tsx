import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PATHS } from '@/app/paths';
import { CommandPalette } from '@/components/common/CommandPalette';
import { Logo } from '@/components/common/Logo';
import { UploadQueuePanel } from '@/features/media/components/UploadQueuePanel';
import { PostComposerHost } from '@/features/media/composer/PostComposerHost';
import { QuickAddTask } from '@/features/tasks/components/QuickAddTask';
import { TaskSheet } from '@/features/tasks/components/TaskSheet';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useSession } from '@/hooks/useSession';
import { GlobalShortcuts } from './GlobalShortcuts';
import { MobileTabBar } from './MobileTabBar';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/** Компьютер: окно со скруглением на сером холсте — сайдбар, шапка, контент (как в референсе). */
const DesktopShell = () => (
  <div className="h-[100dvh] p-3 xl:p-5">
    <div className="mx-auto flex h-full max-w-[1680px] gap-3 rounded-frame bg-white p-3 shadow-frame">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto rounded-card bg-panel px-7 py-7" id="main-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);

/**
 * Телефон: экран во всю ширину, снизу плавающий таббар. Атрибут
 * `vaul-drawer-wrapper` — фон, который уменьшается под шторкой.
 */
const MobileShell = () => (
  <div vaul-drawer-wrapper="" className="min-h-[100dvh] bg-canvas">
    <main className="pb-[calc(var(--tabbar-height)+var(--safe-bottom)+28px)]">
      <Outlet />
    </main>
    <MobileTabBar />
  </div>
);

const Splash = () => (
  <div className="flex h-[100dvh] items-center justify-center">
    <Logo className="animate-pulse" />
  </div>
);

/** Всё за входом: оболочка по ширине экрана и общие слои (карточка задачи, конструктор поста, загрузки, «+», ⌘K). */
export const AppShell = () => {
  const { user, isLoading } = useSession();
  const isDesktop = useIsDesktop();
  const location = useLocation();

  if (isLoading) return <Splash />;
  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${PATHS.login}?redirect=${redirect}`} replace />;
  }

  return (
    <>
      {isDesktop ? <DesktopShell /> : <MobileShell />}
      <TaskSheet />
      <PostComposerHost />
      <UploadQueuePanel />
      <QuickAddTask />
      <CommandPalette />
      {isDesktop && <GlobalShortcuts />}
    </>
  );
};
