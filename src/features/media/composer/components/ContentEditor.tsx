import type { MediaAsset, SocialPlatform } from '@/api/models';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '../../components/PlatformIcon';
import { PLATFORM_META } from '../../lib/platforms';
import { PLATFORM_LIMITS } from '../../lib/rules';
import type { TComposerDraftApi } from '../hooks/useComposerDraft';
import { enabledPlatforms, mediaFor, textFor } from '../model';
import { LengthCounters } from './LengthCounters';
import { MediaStrip } from './MediaStrip';
import { PlatformOptions } from './PlatformOptions';
import { TextEditor } from './TextEditor';

export type TContentTab = 'common' | SocialPlatform;

interface IContentEditorProps {
  api: TComposerDraftApi;
  tab: TContentTab;
  onTab: (tab: TContentTab) => void;
  disabled: boolean;
}

const MEDIA_MAX = 10;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">{children}</div>
);

/**
 * Текст и файлы поста. «Общее» уходит на все площадки; на вкладке площадки
 * можно дать ей свой текст и свои файлы (например, короче для Instagram) и
 * её настройки.
 */
export const ContentEditor = ({ api, tab, onTab, disabled }: IContentEditorProps) => {
  const { draft, assets, setField, patchTarget, patchOptions, rememberAssets } = api;
  const platforms = enabledPlatforms(draft);
  const commonUsers = platforms.filter((platform) => draft.targets[platform].text === null);

  const tabs: Array<{ value: TContentTab; label: React.ReactNode }> = [
    { value: 'common', label: 'Общее' },
    ...platforms.map((platform) => ({
      value: platform as TContentTab,
      label: (
        <span className="inline-flex items-center gap-1.5">
          <PlatformIcon platform={platform} size="xs" bare />
          {PLATFORM_META[platform].title}
          {(draft.targets[platform].text !== null || draft.targets[platform].mediaIds !== null) && (
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" title="Своё содержимое" />
          )}
        </span>
      ),
    })),
  ];

  const tabBar = (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none">
      {tabs.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onTab(item.value)}
          className={cn(
            'h-9 shrink-0 rounded-full px-4 text-[13.5px] font-bold transition-colors',
            tab === item.value ? 'bg-ink text-white' : 'bg-secondary text-ink-soft hover:bg-black/[0.07]',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );

  if (tab === 'common' || !platforms.includes(tab)) {
    return (
      <div className="flex flex-col gap-4">
        {tabBar}
        <TextEditor
          value={draft.text}
          onChange={(text) => setField('text', text)}
          disabled={disabled}
          placeholder="О чём пост? Разметка: **жирный**, __курсив__, [ссылка](https://…)"
          footer={commonUsers.length ? (
            <LengthCounters items={commonUsers.map((platform) => ({ platform, text: draft.text, hasMedia: mediaFor(draft, platform).length > 0 }))} />
          ) : undefined}
        />
        <div>
          <SectionLabel>Файлы</SectionLabel>
          <MediaStrip
            ids={draft.mediaIds}
            assets={assets}
            max={MEDIA_MAX}
            disabled={disabled}
            onChange={(ids) => setField('mediaIds', ids)}
            onAssets={rememberAssets}
          />
        </div>
      </div>
    );
  }

  const platform = tab;
  const target = draft.targets[platform];
  const ownText = target.text !== null;
  const ownMedia = target.mediaIds !== null;
  const title = PLATFORM_META[platform].title;

  return (
    <div className="flex flex-col gap-4">
      {tabBar}
      <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-secondary">
        <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4 px-4">
          <span className="text-[14px] font-semibold text-ink">Свой текст для {title}</span>
          <Switch checked={ownText} disabled={disabled} onCheckedChange={(on) => patchTarget(platform, { text: on ? draft.text : null })} />
        </label>
        <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4 px-4">
          <span className="text-[14px] font-semibold text-ink">Свои файлы для {title}</span>
          <Switch checked={ownMedia} disabled={disabled} onCheckedChange={(on) => patchTarget(platform, { mediaIds: on ? [...draft.mediaIds] : null })} />
        </label>
      </div>

      {ownText ? (
        <TextEditor
          value={target.text ?? ''}
          onChange={(text) => patchTarget(platform, { text })}
          disabled={disabled}
          placeholder={`Текст для ${title}`}
          footer={<LengthCounters items={[{ platform, text: textFor(draft, platform), hasMedia: mediaFor(draft, platform).length > 0 }]} />}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-black/10 px-4 py-3 text-[13px] text-ink-muted">
          <span>{title} получит общий текст.</span>
          <LengthCounters items={[{ platform, text: draft.text, hasMedia: mediaFor(draft, platform).length > 0 }]} />
        </div>
      )}

      {ownMedia && (
        <div>
          <SectionLabel>Файлы для {title}</SectionLabel>
          <MediaStrip
            ids={target.mediaIds ?? []}
            assets={assets}
            max={PLATFORM_LIMITS[platform].mediaMax}
            disabled={disabled}
            onChange={(ids) => patchTarget(platform, { mediaIds: ids })}
            onAssets={(added: MediaAsset[]) => rememberAssets(added)}
          />
        </div>
      )}

      <div>
        <SectionLabel>Настройки {title}</SectionLabel>
        <PlatformOptions platform={platform} options={target.options} disabled={disabled} onChange={(patch) => patchOptions(platform, patch)} />
      </div>
    </div>
  );
};
