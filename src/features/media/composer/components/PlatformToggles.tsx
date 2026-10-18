import { Check } from 'lucide-react';

import type { SocialPlatform } from '@/api/models';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '../../components/PlatformIcon';
import { PLATFORM_META, PLATFORM_ORDER } from '../../lib/platforms';

interface IPlatformTogglesProps {
  enabled: Record<SocialPlatform, boolean>;
  /** Подключены в «Площадках» — остальные выбрать можно, но с пометкой. */
  connected: ReadonlySet<SocialPlatform>;
  disabled?: boolean;
  onToggle: (platform: SocialPlatform) => void;
}

/** Куда выходит пост — три плитки-переключателя. */
export const PlatformToggles = ({ enabled, connected, disabled, onToggle }: IPlatformTogglesProps) => (
  <div className="grid grid-cols-3 gap-2">
    {PLATFORM_ORDER.map((platform) => {
      const on = enabled[platform];
      return (
        <button
          key={platform}
          type="button"
          disabled={disabled}
          onClick={() => onToggle(platform)}
          aria-pressed={on}
          className={cn(
            'relative flex min-h-[64px] flex-col items-center gap-1.5 rounded-2xl border px-2 py-2.5 text-center transition-all sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left',
            on ? 'border-brand-300 bg-brand-50/70 shadow-card' : 'border-black/[0.07] bg-white hover:border-black/15',
            disabled && 'opacity-60',
          )}
        >
          <PlatformIcon platform={platform} size="md" />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-bold text-ink sm:text-[14px]">{PLATFORM_META[platform].title}</span>
            <span className={cn('hidden truncate text-[11.5px] sm:block', connected.has(platform) ? 'text-ink-muted' : 'text-amber-700')}>
              {connected.has(platform) ? (on ? 'Выйдет здесь' : 'Не публикуем') : 'Не подключён'}
            </span>
            {!connected.has(platform) && <span className="block text-[11px] text-amber-700 sm:hidden">не подключён</span>}
          </span>
          {on && (
            <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
              <Check className="h-3 w-3" />
            </span>
          )}
        </button>
      );
    })}
  </div>
);
