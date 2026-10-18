import { describe, expect, it } from 'vitest';

import { countHashtags, insertLink, lengthFor, toPlainText, toTelegramHtml, wrapSelection } from './markup';

describe('toTelegramHtml', () => {
  it('экранирует HTML пользователя до своих тегов', () => {
    expect(toTelegramHtml('<script>alert(1)</script> & **жирный**')).toBe('&lt;script&gt;alert(1)&lt;/script&gt; &amp; <b>жирный</b>');
  });

  it('ставит теги разметки и переводы строк', () => {
    expect(toTelegramHtml('**a** __b__ `c`\nd')).toBe('<b>a</b> <i>b</i> <code>c</code><br/>d');
  });

  it('не экранирует & в адресе ссылки дважды и не даёт выйти из атрибута', () => {
    const html = toTelegramHtml('[тут](https://easyapps.click/a?x=1&y="2")');
    expect(html).toContain('href="https://easyapps.click/a?x=1&amp;y=&quot;2&quot;"');
    expect(html).toContain('>тут</a>');
  });
});

describe('toPlainText и длины', () => {
  it('ссылка в чистом тексте — «подпись (адрес)»', () => {
    expect(toPlainText('**Кейс**: [смотреть](https://easyapps.click)')).toBe('Кейс: смотреть (https://easyapps.click)');
  });

  it('Telegram считает подпись ссылки, остальные — с адресом', () => {
    const text = '[смотреть](https://easyapps.click)';
    expect(lengthFor('telegram', text)).toBe('смотреть'.length);
    expect(lengthFor('vk', text)).toBe('смотреть (https://easyapps.click)'.length);
  });

  it('считает хэштеги, но не якоря в адресах', () => {
    expect(countHashtags('#кейсы и #easyapps, https://site.ru/#anchor')).toBe(2);
  });
});

describe('правка выделения', () => {
  it('оборачивает выделение маркером и сдвигает выделение', () => {
    expect(wrapSelection('сделать важным', 8, 14, '**')).toEqual({ value: 'сделать **важным**', selectionStart: 10, selectionEnd: 16 });
  });

  it('без выделения ссылка подписана адресом', () => {
    expect(insertLink('Смотри ', 7, 7, 'https://a.ru').value).toBe('Смотри [https://a.ru](https://a.ru)');
  });
});
