import { useCallback, useMemo, useState } from 'react';

import type { MediaAsset, MediaPostDetail, PostTargetOptions, SocialPlatform } from '@/api/models';
import { draftFromPost, emptyDraft, sameDraft, type IComposerDraft, type ITargetDraft } from '../model';

interface IComposerSource {
  post: MediaPostDetail | null;
  newDate: string;
  connected: ReadonlySet<SocialPlatform>;
}

/**
 * Состояние конструктора: черновик, исходник (для «есть несохранённое»)
 * и файлы, которые черновик уже видел, — у новых из медиатеки нужны превью
 * до сохранения поста.
 */
export const useComposerDraft = ({ post, newDate, connected }: IComposerSource) => {
  const initial = useMemo(() => (post ? draftFromPost(post) : emptyDraft(newDate, connected)), [post, newDate, connected]);
  const [baseline, setBaseline] = useState<IComposerDraft>(initial);
  const [draft, setDraft] = useState<IComposerDraft>(initial);
  const [assets, setAssets] = useState<Map<string, MediaAsset>>(
    () => new Map((post?.media ?? []).map((asset) => [asset.id, asset])),
  );

  const setField = useCallback(<K extends keyof IComposerDraft>(key: K, value: IComposerDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const patchTarget = useCallback((platform: SocialPlatform, patch: Partial<ITargetDraft>) => {
    setDraft((current) => ({ ...current, targets: { ...current.targets, [platform]: { ...current.targets[platform], ...patch } } }));
  }, []);

  const patchOptions = useCallback((platform: SocialPlatform, patch: PostTargetOptions) => {
    setDraft((current) => ({
      ...current,
      targets: {
        ...current.targets,
        [platform]: { ...current.targets[platform], options: { ...current.targets[platform].options, ...patch } },
      },
    }));
  }, []);

  const rememberAssets = useCallback((added: MediaAsset[]) => {
    setAssets((current) => {
      const next = new Map(current);
      for (const asset of added) next.set(asset.id, asset);
      return next;
    });
  }, []);

  /** После сохранения: сервер вернул пост — он и есть новый исходник. */
  const resetTo = useCallback((saved: IComposerDraft) => {
    setBaseline(saved);
    setDraft(saved);
  }, []);

  return {
    draft,
    dirty: !sameDraft(draft, baseline),
    assets,
    setField,
    patchTarget,
    patchOptions,
    rememberAssets,
    resetTo,
  };
};

export type TComposerDraftApi = ReturnType<typeof useComposerDraft>;
