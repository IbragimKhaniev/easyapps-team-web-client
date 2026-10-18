import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge не знает наших размеров шрифта (`text-kpi`, `text-title`) и
 * принимает их за цвет — тогда `text-kpi text-white` теряет размер. Учим.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['kpi', 'title'] }],
    },
  },
});

/** Склейка классов Tailwind без конфликтов (`p-2` + `p-4` → `p-4`). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
