import type {
  CreateMediaPostBody,
  MediaPost,
  PostTargetOptions,
  SocialPlatform,
  UpdateMediaPostBody,
} from '@/api/models';
import { localTimeOf, suggestedTime } from '../lib/calendar';
import { PLATFORM_ORDER } from '../lib/platforms';

/**
 * Черновик конструктора — то, что человек правит, до сохранения. Отдельно
 * от модели API: время публикации здесь — день плана + «10:00» в поясе
 * человека, а не момент в UTC.
 */

export interface ITargetDraft {
  enabled: boolean;
  /** Свой текст площадки; null — общий. */
  text: string | null;
  /** Свои файлы площадки; null — общие. */
  mediaIds: string[] | null;
  options: PostTargetOptions;
}

export interface IComposerDraft {
  title: string;
  text: string;
  mediaIds: string[];
  plannedDate: string;
  /** «10:00» — время публикации в поясе человека. */
  time: string;
  rubric: string;
  notes: string;
  targets: Record<SocialPlatform, ITargetDraft>;
}

const emptyTarget = (enabled: boolean): ITargetDraft => ({ enabled, text: null, mediaIds: null, options: {} });

/** Новый пост: площадки — те, что подключены (ни одной — пусть выберут сами). */
export const emptyDraft = (plannedDate: string, connected: ReadonlySet<SocialPlatform>): IComposerDraft => ({
  title: '',
  text: '',
  mediaIds: [],
  plannedDate,
  time: suggestedTime(),
  rubric: '',
  notes: '',
  targets: {
    telegram: emptyTarget(connected.has('telegram')),
    instagram: emptyTarget(connected.has('instagram')),
    vk: emptyTarget(connected.has('vk')),
  },
});

export const draftFromPost = (post: MediaPost): IComposerDraft => {
  const targetOf = (platform: SocialPlatform): ITargetDraft => {
    const target = post.targets.find((item) => item.platform === platform);
    return target
      ? { enabled: target.enabled, text: target.text, mediaIds: target.mediaIds, options: target.options ?? {} }
      : emptyTarget(false);
  };
  return {
    title: post.title,
    text: post.text,
    mediaIds: post.mediaIds,
    plannedDate: post.plannedDate,
    time: post.publishAt ? localTimeOf(post.publishAt) : suggestedTime(),
    rubric: post.rubric ?? '',
    notes: post.notes ?? '',
    targets: { telegram: targetOf('telegram'), instagram: targetOf('instagram'), vk: targetOf('vk') },
  };
};

const targetsBody = (draft: IComposerDraft) =>
  PLATFORM_ORDER.map((platform) => ({ platform, ...draft.targets[platform] }));

export const draftToUpdate = (draft: IComposerDraft): UpdateMediaPostBody => ({
  title: draft.title.trim() || 'Без названия',
  text: draft.text,
  mediaIds: draft.mediaIds,
  plannedDate: draft.plannedDate,
  rubric: draft.rubric.trim() || null,
  notes: draft.notes.trim() || null,
  targets: targetsBody(draft),
});

export const draftToCreate = (draft: IComposerDraft, idea = false): CreateMediaPostBody => ({
  ...draftToUpdate(draft),
  title: draft.title.trim() || 'Без названия',
  plannedDate: draft.plannedDate,
  idea,
});

/** Время в черновике менялось отдельно от содержимого — его сравниваем тоже. */
export const sameDraft = (a: IComposerDraft, b: IComposerDraft): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Текст и файлы, которые уйдут на площадку. */
export const textFor = (draft: IComposerDraft, platform: SocialPlatform): string => draft.targets[platform].text ?? draft.text;

export const mediaFor = (draft: IComposerDraft, platform: SocialPlatform): string[] =>
  draft.targets[platform].mediaIds ?? draft.mediaIds;

export const enabledPlatforms = (draft: IComposerDraft): SocialPlatform[] =>
  PLATFORM_ORDER.filter((platform) => draft.targets[platform].enabled);
