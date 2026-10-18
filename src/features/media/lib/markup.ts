import type { SocialPlatform } from '@/api/models';

/**
 * Разметка текста поста — та же, что понимает сервер (team-api
 * `media/textFormat.ts`):  **жирный**, __курсив__, [ссылка](https://…), `код`.
 * Telegram получает её как HTML, VK и Instagram — чистым текстом. Здесь —
 * зеркало для предпросмотра и счётчиков; правила менять в обоих местах.
 */

const BOLD = /\*\*([^*]+?)\*\*/g;
const ITALIC = /__([^_]+?)__/g;
const LINK = /\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g;
const CODE = /`([^`]+?)`/g;

const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Разметка → безопасный HTML для предпросмотра Telegram: сначала экранируем всё, потом ставим свои теги. */
export const toTelegramHtml = (text: string): string =>
  escapeHtml(text)
    .replace(LINK, (_match, label: string, url: string) => `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noreferrer">${label}</a>`)
    .replace(BOLD, '<b>$1</b>')
    .replace(ITALIC, '<i>$1</i>')
    .replace(CODE, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

/** Разметка → чистый текст VK и Instagram (ссылка — «текст (адрес)»). */
export const toPlainText = (text: string): string =>
  text
    .replace(LINK, (_match, label: string, url: string) => (label === url ? url : `${label} (${url})`))
    .replace(BOLD, '$1')
    .replace(ITALIC, '$1')
    .replace(CODE, '$1');

/** Видимый текст Telegram: у ссылки — только подпись. */
export const toTelegramVisibleText = (text: string): string =>
  text.replace(LINK, '$1').replace(BOLD, '$1').replace(ITALIC, '$1').replace(CODE, '$1');

/** Длина так, как её считает площадка. */
export const lengthFor = (platform: SocialPlatform, text: string): number =>
  platform === 'telegram' ? toTelegramVisibleText(text).length : [...toPlainText(text)].length;

export const countHashtags = (text: string): number => (text.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length;

export const countMentions = (text: string): number => (text.match(/(^|\s)@[\w.]+/g) ?? []).length;

/** Хэштеги и упоминания подсветить в предпросмотре Instagram и VK. */
export const highlightTags = (plainText: string): Array<{ text: string; tag: boolean }> => {
  const parts: Array<{ text: string; tag: boolean }> = [];
  const pattern = /([#@][\p{L}\p{N}_.]+)/gu;
  let last = 0;
  for (const match of plainText.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: plainText.slice(last, index), tag: false });
    parts.push({ text: match[0], tag: true });
    last = index + match[0].length;
  }
  if (last < plainText.length) parts.push({ text: plainText.slice(last), tag: false });
  return parts;
};

export interface IMarkupEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** Обернуть выделение маркерами (`**`, `__`, `` ` ``); без выделения — вставить пару и встать между. */
export const wrapSelection = (value: string, start: number, end: number, marker: string): IMarkupEdit => {
  const selected = value.slice(start, end);
  const next = `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`;
  return { value: next, selectionStart: start + marker.length, selectionEnd: end + marker.length };
};

/** Выделение → `[текст](адрес)`; без выделения — адрес и подписью, и ссылкой. */
export const insertLink = (value: string, start: number, end: number, url: string): IMarkupEdit => {
  const label = value.slice(start, end) || url;
  const link = `[${label}](${url})`;
  const next = `${value.slice(0, start)}${link}${value.slice(end)}`;
  return { value: next, selectionStart: start + link.length, selectionEnd: start + link.length };
};
