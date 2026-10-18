import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import type { SocialPlatform } from '@/api/models';
import { isoDateToLocal } from '@/lib/dates';
import { formatCompact } from './format';

/**
 * Графики медиа на recharts в стиле экрана: тонкие оси без линий, подписи
 * серым, сетка пунктиром. Площадки — своими цветами, «всего» — фирменным.
 */
export const CHART_COLORS: Record<SocialPlatform | 'total', string> = {
  telegram: '#229ED9',
  instagram: '#E1306C',
  vk: '#0077FF',
  total: '#0B6A92',
};

export const AXIS_TICK = { fill: '#9CA3AF', fontSize: 11.5, fontWeight: 600 } as const;

export const GRID_PROPS = { stroke: '#EEF1F4', strokeDasharray: '4 4', vertical: false } as const;

/** `2026-10-18` → «18 окт». */
export const dayTick = (isoDate: string): string => format(isoDateToLocal(isoDate), 'd MMM', { locale: ru });

/** 12400 → «12,4 тыс.» */
export const valueTick = (value: number): string => formatCompact(value);

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 14,
    border: 'none',
    boxShadow: '0 20px 50px -20px rgba(17, 24, 39, 0.28), 0 6px 18px -8px rgba(17, 24, 39, 0.12)',
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 600,
  },
  labelStyle: { color: '#6B7280', fontWeight: 600, marginBottom: 4 },
} as const;
