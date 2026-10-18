import { useId } from 'react';

export interface IGaugeSegment {
  label: string;
  value: number;
  color: string;
  /** Штриховка вместо заливки — «в ожидании». */
  hatched?: boolean;
}

interface IGaugeChartProps {
  segments: IGaugeSegment[];
  /** Число в центре (обычно процент первого сегмента). */
  centerValue: string;
  centerLabel: string;
}

const WIDTH = 260;
const HEIGHT = 150;
const RADIUS = 100;
const STROKE = 38;
const CENTER_X = WIDTH / 2;
const CENTER_Y = 130;
/** Зазор между сегментами — в долях полукруга. */
const GAP = 0.012;

const pointAt = (fraction: number): [number, number] => {
  const angle = Math.PI * (1 - fraction);
  return [CENTER_X + RADIUS * Math.cos(angle), CENTER_Y - RADIUS * Math.sin(angle)];
};

const arcPath = (from: number, to: number): string => {
  const [x1, y1] = pointAt(from);
  const [x2, y2] = pointAt(to);
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2}`;
};

/**
 * Полукольцо прогресса, как «Project Progress 41%» в референсе: сегменты по
 * долям, «в ожидании» — штриховкой, процент в центре, легенда снизу.
 */
export const GaugeChart = ({ segments, centerValue, centerLabel }: IGaugeChartProps) => {
  const patternId = useId();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let cursor = 0;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-[300px]">
        <defs>
          <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#F3F6F8" />
            <rect width="3" height="8" fill="rgba(11,106,146,0.4)" />
          </pattern>
        </defs>
        <path d={arcPath(0, 1)} fill="none" stroke="#EEF2F5" strokeWidth={STROKE} strokeLinecap="round" />
        {segments.map((segment) => {
          const from = cursor;
          const span = segment.value / total;
          cursor += span;
          if (span <= GAP) return null;
          return (
            <path
              key={segment.label}
              d={arcPath(from + GAP / 2, from + span - GAP / 2)}
              fill="none"
              stroke={segment.hatched ? `url(#${patternId})` : segment.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          );
        })}
        <text x={CENTER_X} y={CENTER_Y - 18} textAnchor="middle" className="fill-ink" style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em' }}>
          {centerValue}
        </text>
        <text x={CENTER_X} y={CENTER_Y + 4} textAnchor="middle" className="fill-ink-muted" style={{ fontSize: 13, fontWeight: 600 }}>
          {centerLabel}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
            <span
              className={segment.hatched ? 'bg-hatched h-3.5 w-3.5 rounded-full' : 'h-3.5 w-3.5 rounded-full'}
              style={segment.hatched ? undefined : { background: segment.color }}
            />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  );
};
