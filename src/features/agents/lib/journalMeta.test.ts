import { describe, expect, it } from 'vitest';

import { agentLabel, formatMinutes, isConversationOnly, workPill } from './journalMeta';

describe('вид журнала работы', () => {
  it('время работы — по-человечески', () => {
    expect(formatMinutes(0)).toBe('меньше минуты');
    expect(formatMinutes(42.4)).toBe('42 мин');
    expect(formatMinutes(60)).toBe('1 ч');
    expect(formatMinutes(135)).toBe('2 ч 15 мин');
  });

  it('пилюля: живая работа, без итога и исход', () => {
    expect(workPill({ status: 'active', outcome: null }).label).toBe('Идёт');
    expect(workPill({ status: 'abandoned', outcome: null }).label).toBe('Без итога');
    expect(workPill({ status: 'finished', outcome: 'blocked' }).label).toBe('Упёрлись');
    expect(workPill({ status: 'finished', outcome: null }).label).toBe('Без итога');
  });

  it('агент — название и версия из подключения', () => {
    expect(agentLabel({ client: 'claude-code', clientLabel: 'claude-code 2.1.300' })).toBe('Claude Code 2.1.300');
    expect(agentLabel({ client: 'codex', clientLabel: null })).toBe('Codex');
  });

  it('разговор без задачи — только из хука и без задачи', () => {
    expect(isConversationOnly({ taskId: null, origin: 'hook' })).toBe(true);
    expect(isConversationOnly({ taskId: 'abc', origin: 'hook' })).toBe(false);
    expect(isConversationOnly({ taskId: null, origin: 'agent' })).toBe(false);
  });
});
