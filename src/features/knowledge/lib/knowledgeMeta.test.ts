import { BookOpen, Megaphone } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { parseTags, plainPreview, sectionIcon } from './knowledgeMeta';

describe('карточка базы знаний', () => {
  it('превью снимает разметку markdown', () => {
    const markdown = [
      '## Итог теста',
      '',
      '- креатив **с лицом** дал CTR *выше*',
      '1. ставка `start_work` — ~~старая~~ новая',
      '> цитата из [отчёта](https://vk.com/ads)',
      '---',
      '![график](chart.png)',
      '```',
      'код не показываем',
      '```',
      'конец',
    ].join('\n');
    expect(plainPreview(markdown)).toBe('Итог теста креатив с лицом дал CTR выше ставка start_work — старая новая цитата из отчёта конец');
  });

  it('дефисы и подчёркивания внутри слов остаются', () => {
    expect(plainPreview('что-то про A/B-тест и search_knowledge')).toBe('что-то про A/B-тест и search_knowledge');
  });

  it('длинный текст обрезается многоточием до нужной длины', () => {
    const preview = plainPreview('слово '.repeat(100), 40);
    expect(preview).toHaveLength(40);
    expect(preview.endsWith('…')).toBe(true);
  });

  it('метки: без пробелов, в нижнем регистре, без повторов, не больше 10', () => {
    expect(parseTags('vk, рилсы ,Тон, VK,, ')).toEqual(['vk', 'рилсы', 'тон']);
    expect(parseTags(Array.from({ length: 15 }, (_, index) => `t${index}`).join(','))).toHaveLength(10);
  });

  it('иконка раздела: известная — своя, неизвестная — книга', () => {
    expect(sectionIcon('Megaphone')).toBe(Megaphone);
    expect(sectionIcon('нет-такой')).toBe(BookOpen);
  });
});
