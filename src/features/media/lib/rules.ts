import type { InstagramPostType, MediaKind, SocialPlatform } from '@/api/models';

/**
 * Лимиты площадок для живых счётчиков редактора — зеркало team-api
 * `media/platformRules.ts`. Окончательно пост проверяет сервер (список
 * `issues`), здесь — подсказка до сохранения.
 */
export interface IPlatformLimits {
  /** Текст без файлов. */
  textMax: number;
  /** Подпись к файлам. */
  captionMax: number;
  mediaMax: number;
  requiresMedia: boolean;
  kinds: ReadonlyArray<MediaKind>;
}

export const PLATFORM_LIMITS: Record<SocialPlatform, IPlatformLimits> = {
  telegram: { textMax: 4096, captionMax: 1024, mediaMax: 10, requiresMedia: false, kinds: ['image', 'video', 'audio', 'document'] },
  instagram: { textMax: 2200, captionMax: 2200, mediaMax: 10, requiresMedia: true, kinds: ['image', 'video'] },
  vk: { textMax: 16384, captionMax: 16384, mediaMax: 10, requiresMedia: false, kinds: ['image', 'video', 'document'] },
};

export const INSTAGRAM_HASHTAGS_MAX = 30;
export const INSTAGRAM_MENTIONS_MAX = 20;

/** Сколько символов можно для текста с файлами или без. */
export const textLimitFor = (platform: SocialPlatform, hasMedia: boolean): number =>
  hasMedia ? PLATFORM_LIMITS[platform].captionMax : PLATFORM_LIMITS[platform].textMax;

export const INSTAGRAM_TYPE_LABELS: Record<InstagramPostType, string> = {
  feed: 'Пост в ленте',
  reel: 'Рилс',
  story: 'История',
};
