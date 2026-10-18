import { describe, expect, it } from 'vitest';

import type { Integration } from '@/api/models';
import { changesOf, draftOf } from './fieldDraft';

const telegram = {
  platform: 'telegram',
  settings: { channel: '@easyapps', apiId: 1234567, proxyUrl: null },
  secrets: { botToken: '…a1b2', apiHash: null },
  fields: [
    { key: 'botToken', label: 'Токен бота', type: 'secret', required: true },
    { key: 'channel', label: 'Канал', type: 'text', required: true },
    { key: 'apiId', label: 'api_id', type: 'number', required: false },
    { key: 'apiHash', label: 'api_hash', type: 'secret', required: false },
    { key: 'proxyUrl', label: 'Прокси', type: 'url', required: false },
  ],
} as unknown as Integration;

describe('черновик формы площадки', () => {
  it('несекретные поля — строками, секретов в черновике нет', () => {
    expect(draftOf(telegram)).toEqual({ settings: { channel: '@easyapps', apiId: '1234567', proxyUrl: '' }, secrets: {} });
  });

  it('отправляются только тронутые поля; очищенное поле — null', () => {
    const draft = draftOf(telegram);
    draft.settings.proxyUrl = ' http://proxy:3128 ';
    draft.settings.apiId = '';
    expect(changesOf(telegram, draft)).toEqual({ settings: { proxyUrl: 'http://proxy:3128', apiId: null }, secrets: undefined });
  });

  it('открытый для замены, но пустой секрет не отправляется', () => {
    const draft = { ...draftOf(telegram), secrets: { botToken: '', apiHash: ' hash ' } };
    expect(changesOf(telegram, draft)).toEqual({ settings: undefined, secrets: { apiHash: 'hash' } });
  });
});
