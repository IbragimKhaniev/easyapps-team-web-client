import { RotateCw } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { reloadApp } from '@/lib/appUpdate';

/** Сколько экран ждёт, прежде чем перезапустить страницу сам. */
const AUTO_RELOAD_SECONDS = 3;
/** Сверяемся с часами чаще раза в секунду, чтобы цифра менялась вовремя. */
const COUNTDOWN_TICK_MS = 200;
/** Кольцо отсчёта в координатах viewBox 0 0 80 80; длина окружности — для штриха. */
const RING_RADIUS = 36;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * Секунды до перезапуска — по часам, а не по числу тиков: в фоновой вкладке
 * таймеры замедляются, и счёт тиками растянулся бы. Дошло до нуля — перезапуск.
 */
const useReloadCountdown = (enabled: boolean): number => {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RELOAD_SECONDS);

  useEffect(() => {
    if (!enabled) return;
    const deadline = Date.now() + AUTO_RELOAD_SECONDS * 1000;
    const timer = window.setInterval(() => {
      const left = Math.ceil((deadline - Date.now()) / 1000);
      if (left <= 0) {
        window.clearInterval(timer);
        reloadApp();
        return;
      }
      setSecondsLeft(left);
    }, COUNTDOWN_TICK_MS);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return secondsLeft;
};

/** Кольцо тает за AUTO_RELOAD_SECONDS, в середине — сколько секунд осталось. */
const CountdownRing = ({ secondsLeft }: { secondsLeft: number }) => {
  const ringStyle = {
    strokeDasharray: RING_LENGTH,
    animationDuration: `${AUTO_RELOAD_SECONDS}s`,
    '--ring-length': RING_LENGTH,
  } as CSSProperties;

  return (
    <div role="timer" aria-label={`Перезапуск через ${secondsLeft} с`} className="relative h-20 w-20">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={RING_RADIUS} fill="none" strokeWidth="5" className="stroke-brand-100" />
        <circle
          cx="40"
          cy="40"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="animate-countdown-ring stroke-brand motion-reduce:animate-none"
          style={ringStyle}
        />
      </svg>
      <span className="tabular absolute inset-0 flex items-center justify-center text-[30px] font-extrabold tracking-tight text-ink">
        {secondsLeft}
      </span>
    </div>
  );
};

interface IAppUpdateScreenProps {
  /** Идёт ли отсчёт. Нет — перезапуск только что был и не помог: остаётся кнопка. */
  autoReload: boolean;
}

/**
 * Экран вместо приложения, когда не загрузился чанк: после выката старых
 * файлов на хостинге нет, и открытая раньше вкладка дальше не работает.
 * Когда его показывать — решает `lib/appUpdate.ts`. Живёт в стартовом бандле:
 * лениво его не загрузить по той же причине, по которой он нужен.
 */
export const AppUpdateScreen = ({ autoReload }: IAppUpdateScreenProps) => {
  const secondsLeft = useReloadCountdown(autoReload);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
      aria-describedby="app-update-text"
      // fixed и pointer-events-auto — на случай, если окно Radix или шторка vaul
      // не успели снять свои стили с body: экран всё равно сверху и нажимается
      className="pointer-events-auto fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-canvas px-4 py-10"
    >
      <div className="w-full max-w-[420px] animate-fade-up motion-reduce:animate-none">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card-surface flex flex-col items-center gap-5 p-7 text-center shadow-frame">
          {autoReload ? (
            <CountdownRing secondsLeft={secondsLeft} />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <RotateCw className="h-8 w-8" aria-hidden="true" />
            </div>
          )}

          <div>
            <h1 id="app-update-title" className="text-[28px] font-extrabold tracking-tight text-ink">
              Платформа обновилась
            </h1>
            <p id="app-update-text" className="mt-1.5 text-[15px] text-ink-muted">
              {autoReload
                ? 'Вышла новая версия — нужно перезапустить страницу. Все данные на месте.'
                : 'Страница не загрузилась и после перезапуска. Попробуйте ещё раз, а если не выйдет — проверьте подключение к интернету.'}
            </p>
          </div>

          <Button size="lg" className="w-full" onClick={reloadApp} autoFocus>
            <RotateCw />
            {autoReload ? 'Перезапустить сейчас' : 'Перезапустить'}
          </Button>
        </div>
      </div>
    </div>
  );
};
