import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@/app/queryClient';
import { router } from '@/app/routes';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsDesktop } from '@/hooks/useMediaQuery';

const ToastLayer = () => {
  const isDesktop = useIsDesktop();
  // На телефоне тосты над таббаром, на компьютере — в углу.
  return <Toaster position={isDesktop ? 'bottom-right' : 'top-center'} />;
};

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={400}>
      <RouterProvider router={router} />
      <ToastLayer />
    </TooltipProvider>
  </QueryClientProvider>
);
