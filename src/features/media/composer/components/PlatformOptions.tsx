import type { InstagramPostType, PostTargetOptions, SocialPlatform } from '@/api/models';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Switch } from '@/components/ui/switch';
import { INSTAGRAM_TYPE_LABELS } from '../../lib/rules';

interface IPlatformOptionsProps {
  platform: SocialPlatform;
  options: PostTargetOptions;
  disabled?: boolean;
  onChange: (patch: PostTargetOptions) => void;
}

interface IToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleRow = ({ label, hint, checked, disabled, onChange }: IToggleRowProps) => (
  <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-4 px-4 py-2.5">
    <span>
      <span className="block text-[14px] font-semibold text-ink">{label}</span>
      {hint && <span className="block text-[12px] text-ink-muted">{hint}</span>}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </label>
);

const INSTAGRAM_TYPES: InstagramPostType[] = ['feed', 'reel', 'story'];

/** Настройки площадки в посте — строки как в «Настройках» iOS. */
export const PlatformOptions = ({ platform, options, disabled, onChange }: IPlatformOptionsProps) => {
  const rows = (() => {
    switch (platform) {
      case 'telegram':
        return [
          <ToggleRow key="silent" label="Без звука" hint="Подписчики получат уведомление тихо" checked={Boolean(options.silent)} disabled={disabled} onChange={(silent) => onChange({ silent })} />,
          <ToggleRow key="preview" label="Без превью ссылки" checked={Boolean(options.disablePreview)} disabled={disabled} onChange={(disablePreview) => onChange({ disablePreview })} />,
          <ToggleRow key="pin" label="Закрепить в канале" checked={Boolean(options.pin)} disabled={disabled} onChange={(pin) => onChange({ pin })} />,
        ];
      case 'vk':
        return [
          <ToggleRow key="signed" label="Подпись автора" hint="Под постом — кто его опубликовал" checked={Boolean(options.signed)} disabled={disabled} onChange={(signed) => onChange({ signed })} />,
          <ToggleRow key="comments" label="Закрыть комментарии" checked={Boolean(options.closeComments)} disabled={disabled} onChange={(closeComments) => onChange({ closeComments })} />,
        ];
      default:
        return (options.instagramType ?? 'feed') === 'reel'
          ? [<ToggleRow key="feed" label="Показать и в ленте профиля" checked={options.shareToFeed ?? true} disabled={disabled} onChange={(shareToFeed) => onChange({ shareToFeed })} />]
          : [];
    }
  })();

  return (
    <div className="flex flex-col gap-3">
      {platform === 'instagram' && (
        <SegmentedControl
          segments={INSTAGRAM_TYPES.map((type) => ({ value: type, label: INSTAGRAM_TYPE_LABELS[type] }))}
          value={options.instagramType ?? 'feed'}
          onChange={(instagramType) => !disabled && onChange({ instagramType })}
          size="sm"
          className="self-start"
        />
      )}
      {rows.length > 0 && (
        <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl bg-secondary">{rows}</div>
      )}
    </div>
  );
};
