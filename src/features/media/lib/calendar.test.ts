import { describe, expect, it } from 'vitest';

import { lastDayOfMonth, monthWeeks, publishMomentOf, shiftMonth } from './calendar';

describe('сетка месяца', () => {
  it('октябрь 2026: недели с понедельника 28 сентября по воскресенье 1 ноября', () => {
    const weeks = monthWeeks('2026-10', '2026-10-18');
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toMatchObject({ iso: '2026-09-28', inMonth: false });
    expect(weeks[4][6]).toMatchObject({ iso: '2026-11-01', inMonth: false });
    expect(weeks.flat().find((day) => day.isToday)?.iso).toBe('2026-10-18');
    expect(weeks.flat().filter((day) => day.isWeekend && day.inMonth)).toHaveLength(9);
  });

  it('месяц, который начинается в воскресенье, занимает 6 недель', () => {
    expect(monthWeeks('2026-11')).toHaveLength(6);
  });

  it('последний день и сдвиг месяца — через границу года', () => {
    expect(lastDayOfMonth('2026-02')).toBe('2026-02-28');
    expect(lastDayOfMonth('2028-02')).toBe('2028-02-29');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});

describe('момент публикации', () => {
  it('день плана + время — в поясе человека', () => {
    const moment = new Date(publishMomentOf('2026-10-20', '10:30'));
    expect([moment.getFullYear(), moment.getMonth() + 1, moment.getDate(), moment.getHours(), moment.getMinutes()]).toEqual([2026, 10, 20, 10, 30]);
  });
});
