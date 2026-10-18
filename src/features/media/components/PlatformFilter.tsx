import type { SocialPlatform } from '@/api/models';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PLATFORM_META, PLATFORM_ORDER } from '../lib/platforms';
import { PlatformIcon } from './PlatformIcon';

type TValue = SocialPlatform | 'all';

interface IPlatformFilterProps {
  value: SocialPlatform | null;
  onChange: (value: SocialPlatform | null) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** «Все площадки / Telegram / Instagram / VK» — одинаково в плане, ленте и аналитике. */
export const PlatformFilter = ({ value, onChange, size = 'md', className }: IPlatformFilterProps) => (
  <SegmentedControl<TValue>
    segments={[
      { value: 'all', label: 'Все' },
      ...PLATFORM_ORDER.map((platform) => ({
        value: platform as TValue,
        label: (
          <>
            <PlatformIcon platform={platform} size="xs" bare />
            <span className="hidden sm:inline">{PLATFORM_META[platform].title}</span>
            <span className="sm:hidden">{PLATFORM_META[platform].short}</span>
          </>
        ),
      })),
    ]}
    value={value ?? 'all'}
    onChange={(next) => onChange(next === 'all' ? null : next)}
    size={size}
    className={className}
  />
);
