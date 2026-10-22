import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@/app/queryClient';
import { router } from '@/app/routes';
import { AppUpdateScreen } from '@/components/common/AppUpdateScreen';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const ToastLayer = () => {
  const isDesktop = useIsDesktop();
  // На телефоне тосты над таббаром, на компьютере — в углу.
  return <Toaster position={isDesktop ? 'bottom-right' : 'top-center'} />;
};

export const App = () => {
  const appUpdate = useAppUpdate();

  // Не загрузился чанк после выката — экран с перезапуском вместо всего
  // дерева: окна и шторки размонтируются и не держат за собой фокус.
  if (appUpdate) return <AppUpdateScreen autoReload={appUpdate.autoReload} />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={400}>
        <RouterProvider router={router} />
        <ToastLayer />
      </TooltipProvider>
    </QueryClientProvider>
  );
};
