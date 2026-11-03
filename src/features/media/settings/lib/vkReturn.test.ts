import { describe, expect, it } from 'vitest';

import { claimVkReturn, vkReturnFromLocation } from './vkReturn';

const state = 'a'.repeat(43);

describe('возврат со страницы VK', () => {
  it('читает JSON из параметра payload', () => {
    const payload = encodeURIComponent(JSON.stringify({
      code: 'vk2.a.code',
      state,
      type: 'code_v2',
      device_id: 'device-1',
    }));
    expect(vkReturnFromLocation(`?payload=${payload}`)).toEqual({
      code: 'vk2.a.code',
      deviceId: 'device-1',
      state,
    });
  });

  it('читает те же поля из query и из hash', () => {
    expect(vkReturnFromLocation(`?code=abc&device_id=dev&state=${state}`)).toEqual({
      code: 'abc',
      deviceId: 'dev',
      state,
    });
    expect(vkReturnFromLocation('', `#code=abc&device_id=dev&state=${state}`)).toEqual({
      code: 'abc',
      deviceId: 'dev',
      state,
    });
  });

  it('отказ VK — текст ошибки, чужой адрес — не возврат', () => {
    const payload = encodeURIComponent(JSON.stringify({ error: 'access_denied', error_description: 'Отклонено', state }));
    expect(vkReturnFromLocation(`?payload=${payload}`)).toEqual({ error: 'Отклонено', state });
    expect(vkReturnFromLocation('?higgsfield=connected')).toBeNull();
  });

  it('один и тот же state обменивается один раз', () => {
    const once = `once-${state}`;
    expect(claimVkReturn(once)).toBe(true);
    expect(claimVkReturn(once)).toBe(false);
  });
});
