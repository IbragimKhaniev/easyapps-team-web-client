import type { SocialPlatform } from '@/api/models';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '../../components/PlatformIcon';
import { countHashtags, lengthFor } from '../../lib/markup';
import { INSTAGRAM_HASHTAGS_MAX, textLimitFor } from '../../lib/rules';

interface ILengthCountersProps {
  /** Площадка → её текст и есть ли у неё файлы (лимит подписи меньше лимита текста). */
  items: Array<{ platform: SocialPlatform; text: string; hasMedia: boolean }>;
}

/** Сколько символов занято на каждой площадке — так, как считает сама площадка. */
export const LengthCounters = ({ items }: ILengthCountersProps) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    {items.map(({ platform, text, hasMedia }) => {
      const length = lengthFor(platform, text);
      const limit = textLimitFor(platform, hasMedia);
      const over = length > limit;
      const hashtags = platform === 'instagram' ? countHashtags(text) : 0;
      return (
        <span key={platform} className={cn('inline-flex items-center gap-1.5 text-[12px] font-semibold tabular', over ? 'text-rose-600' : 'text-ink-muted')}>
          <PlatformIcon platform={platform} size="xs" />
          {length.toLocaleString('ru-RU')} / {limit.toLocaleString('ru-RU')}
          {hashtags > 0 && (
            <span className={cn(hashtags > INSTAGRAM_HASHTAGS_MAX && 'text-rose-600')}>
              · #{hashtags}/{INSTAGRAM_HASHTAGS_MAX}
            </span>
          )}
        </span>
      );
    })}
  </div>
);
