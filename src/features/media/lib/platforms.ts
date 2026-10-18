import type { SocialPlatform } from '@/api/models';

/** Порядок площадок везде один: как в настройках и в посте. */
export const PLATFORM_ORDER: SocialPlatform[] = ['telegram', 'instagram', 'vk'];

export interface IPlatformMeta {
  title: string;
  /** Короткая подпись на счётчиках и чипах. */
  short: string;
  /** Фирменный цвет площадки — только для значка и тонких акцентов, не для заливок экрана. */
  color: string;
  /** Светлый фон под значком. */
  soft: string;
}

export const PLATFORM_META: Record<SocialPlatform, IPlatformMeta> = {
  telegram: { title: 'Telegram', short: 'TG', color: '#229ED9', soft: '#E4F4FC' },
  instagram: { title: 'Instagram', short: 'IG', color: '#E1306C', soft: '#FDE8F0' },
  vk: { title: 'VK', short: 'VK', color: '#0077FF', soft: '#E6F0FF' },
};

export const isPlatform = (value: string | null | undefined): value is SocialPlatform =>
  Boolean(value) && PLATFORM_ORDER.includes(value as SocialPlatform);
