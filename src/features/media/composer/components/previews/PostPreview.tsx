import { useEffect, useState } from 'react';

import type { MediaAsset, SocialPlatform } from '@/api/models';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PlatformIcon } from '../../../components/PlatformIcon';
import type { IPlatformAccount } from '../../../hooks/useIntegrationsState';
import { PLATFORM_META } from '../../../lib/platforms';
import { mediaFor, textFor, type IComposerDraft } from '../../model';
import { InstagramPreview } from './InstagramPreview';
import { TelegramPreview } from './TelegramPreview';
import { VkPreview } from './VkPreview';

interface IPostPreviewProps {
  draft: IComposerDraft;
  platforms: SocialPlatform[];
  assets: Map<string, MediaAsset>;
  accountOf: (platform: SocialPlatform) => IPlatformAccount;
  /** Площадка, которую сейчас правят, — предпросмотр следует за ней. */
  focusPlatform?: SocialPlatform | null;
}

/** Предпросмотр поста на выбранной площадке — со своим текстом и файлами площадки. */
export const PostPreview = ({ draft, platforms, assets, accountOf, focusPlatform }: IPostPreviewProps) => {
  const [platform, setPlatform] = useState<SocialPlatform | null>(platforms[0] ?? null);

  useEffect(() => {
    if (focusPlatform && platforms.includes(focusPlatform)) setPlatform(focusPlatform);
  }, [focusPlatform, platforms]);

  useEffect(() => {
    if (!platform || !platforms.includes(platform)) setPlatform(platforms[0] ?? null);
  }, [platform, platforms]);

  if (!platform) {
    return <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink-muted">Включите площадку — здесь будет пост так, как его увидят подписчики.</div>;
  }

  const text = textFor(draft, platform);
  const media = mediaFor(draft, platform).map((id) => assets.get(id)).filter((asset): asset is MediaAsset => Boolean(asset));
  const account = accountOf(platform);

  return (
    <div className="flex flex-col gap-4">
      {platforms.length > 1 && (
        <SegmentedControl
          segments={platforms.map((item) => ({
            value: item,
            label: <><PlatformIcon platform={item} size="xs" bare /> {PLATFORM_META[item].title}</>,
          }))}
          value={platform}
          onChange={setPlatform}
          size="sm"
          className="self-center"
        />
      )}
      {platform === 'telegram' && <TelegramPreview channelTitle={account.title} text={text} media={media} time={draft.time} />}
      {platform === 'instagram' && (
        <InstagramPreview handle={account.handle} text={text} media={media} type={draft.targets.instagram.options.instagramType ?? 'feed'} />
      )}
      {platform === 'vk' && <VkPreview communityTitle={account.title} text={text} media={media} />}
    </div>
  );
};
