import { describe, expect, it } from 'vitest';

import { draftToUpdate, emptyDraft, enabledPlatforms, mediaFor, textFor } from './model';

describe('черновик конструктора', () => {
  it('новый пост включает только подключённые площадки', () => {
    const draft = emptyDraft('2026-10-20', new Set(['telegram', 'vk']));
    expect(enabledPlatforms(draft)).toEqual(['telegram', 'vk']);
    expect(draft.plannedDate).toBe('2026-10-20');
  });

  it('свой текст и файлы площадки перекрывают общие', () => {
    const draft = emptyDraft('2026-10-20', new Set(['telegram', 'instagram']));
    draft.text = 'Общий';
    draft.mediaIds = ['a', 'b'];
    draft.targets.instagram.text = 'Короче для Instagram';
    draft.targets.instagram.mediaIds = ['b'];
    expect(textFor(draft, 'telegram')).toBe('Общий');
    expect(textFor(draft, 'instagram')).toBe('Короче для Instagram');
    expect(mediaFor(draft, 'telegram')).toEqual(['a', 'b']);
    expect(mediaFor(draft, 'instagram')).toEqual(['b']);
  });

  it('в API уходят все три площадки по порядку, пустые поля — null, без названия — «Без названия»', () => {
    const draft = emptyDraft('2026-10-20', new Set(['vk']));
    const body = draftToUpdate({ ...draft, title: '  ', rubric: ' ', notes: '' });
    expect(body.title).toBe('Без названия');
    expect(body.rubric).toBeNull();
    expect(body.notes).toBeNull();
    expect(body.targets?.map((target) => [target.platform, target.enabled])).toEqual([['telegram', false], ['instagram', false], ['vk', true]]);
  });
});
