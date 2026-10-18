import { useId } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { SeriesPoint, SocialPlatform } from '@/api/models';
import { AXIS_TICK, CHART_COLORS, dayTick, GRID_PROPS, TOOLTIP_STYLE, valueTick } from '../../lib/chartTheme';
import { formatNumber } from '../../lib/format';
import { PLATFORM_META } from '../../lib/platforms';

interface ISeriesChartProps {
  data: SeriesPoint[];
  /** Какие площадки рисовать: одна — одной линией, несколько — рядом. */
  platforms: SocialPlatform[];
  kind: 'area' | 'bar';
  /** Столбики площадок друг на друге (сумма за день). */
  stacked?: boolean;
  height?: number;
  label: string;
}

const seriesName = (key: string): string => (key === 'total' ? 'Всего' : PLATFORM_META[key as SocialPlatform]?.title ?? key);

/**
 * Ряд по дням: площадки своими цветами. Пропуск (null) — «нет данных», а
 * не ноль: линия не падает в ноль там, где площадка молчит.
 */
export const SeriesChart = ({ data, platforms, kind, stacked = false, height = 240, label }: ISeriesChartProps) => {
  const keys: Array<SocialPlatform> = platforms;
  // id градиента — без двоеточий useId: иначе url(#…) в SVG не находит заливку.
  const chartId = useId().replace(/:/g, '');
  const common = {
    data,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  };
  const axes = (
    <>
      <CartesianGrid {...GRID_PROPS} />
      <XAxis dataKey="date" tickFormatter={dayTick} tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={20} />
      <YAxis tickFormatter={valueTick} tick={AXIS_TICK} axisLine={false} tickLine={false} width={48} allowDecimals={false} />
      <Tooltip
        {...TOOLTIP_STYLE}
        cursor={{ fill: 'rgba(11, 106, 146, 0.06)' }}
        labelFormatter={(value: string) => dayTick(value)}
        formatter={(value: number, name: string) => [formatNumber(value), seriesName(name)]}
      />
      {keys.length > 1 && <Legend formatter={(value: string) => <span className="text-[12px] font-semibold text-ink-soft">{seriesName(value)}</span>} iconType="circle" iconSize={8} />}
    </>
  );

  return (
    <div style={{ height }} aria-label={label} role="img">
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'bar' ? (
          <BarChart {...common} barCategoryGap="22%">
            {axes}
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? 'day' : undefined}
                fill={CHART_COLORS[key]}
                radius={stacked ? (index === keys.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]) : [6, 6, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        ) : (
          <AreaChart {...common}>
            <defs>
              {keys.map((key) => (
                <linearGradient key={key} id={`fill-${chartId}-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS[key]} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART_COLORS[key]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {axes}
            {keys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[key]}
                strokeWidth={2.5}
                fill={`url(#fill-${chartId}-${key})`}
                connectNulls
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
