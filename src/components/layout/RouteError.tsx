import { RotateCw } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { PATHS } from '@/app/paths';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { isChunkLoadError, reloadApp, requestAppUpdate } from '@/lib/appUpdate';

/** Текст ошибки — сайт внутренний: команде он подскажет, что сломалось. */
const errorDetails = (error: unknown): string | null => {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return null;
};

/**
 * Ошибка любого маршрута — свой экран вместо голого «Unexpected Application
 * Error!» роутера. Не загрузился чанк — экран «Платформа обновилась» (его
 * рисует App вместо всего дерева), прочее — «Что-то пошло не так».
 */
export const RouteError = () => {
  const error = useRouteError();
  const isChunkError = isChunkLoadError(error);

  // До отрисовки: экран обновления встаёт сразу, без кадра пустой страницы.
  useLayoutEffect(() => {
    if (isChunkError) requestAppUpdate();
  }, [isChunkError]);

  if (isChunkError) return null;

  const details = errorDetails(error);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card-surface flex flex-col gap-5 p-7 shadow-frame">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Что-то пошло не так</h1>
            <p className="mt-1.5 text-[15px] text-ink-muted">
              Страница сломалась. Обновите её — обычно это помогает. Если ошибка повторяется, пришлите текст ниже
              разработчику.
            </p>
          </div>

          {details && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-secondary px-3.5 py-3 font-mono text-[12px] text-ink-soft">
              {details}
            </pre>
          )}

          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={reloadApp}>
              <RotateCw />
              Обновить страницу
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full">
              <a href={PATHS.overview}>На главную</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
