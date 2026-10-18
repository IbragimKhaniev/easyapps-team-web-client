import type { SocialPlatform } from '@/api/models';
import { cn } from '@/lib/utils';
import { PLATFORM_META } from '../lib/platforms';

interface IGlyphProps {
  className?: string;
}

/** Бумажный самолётик Telegram. */
const TelegramGlyph = ({ className }: IGlyphProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M20.7 3.7 2.9 10.6c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.8 5.4c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.2 4.6 3.4c.8.5 1.4.2 1.7-.8l3-14.2c.3-1.2-.5-1.8-1.6-1.2Zm-3 3.6-8.4 7.6-.3 3.4-1.5-4.8 9.6-6c.5-.3.9 0 .6-.2Z" />
  </svg>
);

/** Камера Instagram. */
const InstagramGlyph = ({ className }: IGlyphProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.3" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

/** Буквы VK. */
const VkGlyph = ({ className }: IGlyphProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M13 17.5c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.3-2 3.8-4h2.6c-.4 2.4-2.2 4.2-3.5 5 1.3.6 3.3 2.2 4.1 5h-2.9c-.6-1.9-2.1-3.3-4.1-3.5v3.5H13Z" />
  </svg>
);

const GLYPHS: Record<SocialPlatform, (props: IGlyphProps) => JSX.Element> = {
  telegram: TelegramGlyph,
  instagram: InstagramGlyph,
  vk: VkGlyph,
};

const SIZES = {
  xs: { box: 'h-5 w-5', glyph: 'h-3 w-3' },
  sm: { box: 'h-7 w-7', glyph: 'h-4 w-4' },
  md: { box: 'h-9 w-9', glyph: 'h-5 w-5' },
  lg: { box: 'h-12 w-12', glyph: 'h-6 w-6' },
} as const;

interface IPlatformIconProps {
  platform: SocialPlatform;
  size?: keyof typeof SIZES;
  /** Только знак, без кружка. */
  bare?: boolean;
  className?: string;
}

/** Значок площадки: знак в фирменном цвете на светлом кружке. */
export const PlatformIcon = ({ platform, size = 'sm', bare = false, className }: IPlatformIconProps) => {
  const Glyph = GLYPHS[platform];
  const meta = PLATFORM_META[platform];
  if (bare) return <Glyph className={cn(SIZES[size].glyph, className)} />;
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full', SIZES[size].box, className)}
      style={{ backgroundColor: meta.soft, color: meta.color }}
      title={meta.title}
    >
      <Glyph className={SIZES[size].glyph} />
    </span>
  );
};
