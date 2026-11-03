export interface IVkReturn {
  code?: string;
  deviceId?: string;
  state?: string;
  error?: string;
}

const text = (value: unknown): string | undefined =>
  (typeof value === 'string' && value.trim() ? value.trim() : undefined);

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  (value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined);

/** `payload` приходит JSON-строкой, иногда ещё раз закодированной или в base64url. */
const parsePayload = (raw: string | null): Record<string, unknown> | undefined => {
  if (!raw) return undefined;
  const attempts = [raw];
  try { attempts.push(decodeURIComponent(raw)); } catch { /* уже разобрано */ }
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    attempts.push(atob(padded));
  } catch { /* не base64 */ }
  for (const attempt of attempts) {
    try {
      const parsed = asRecord(JSON.parse(attempt));
      if (parsed) return parsed;
    } catch { /* следующий вид */ }
  }
  return undefined;
};

/**
 * Ответ VK ID на доверенный redirect. Успех — `payload` с code, state и
 * device_id, либо те же поля прямо в query. Отказ — error и state.
 */
export const vkReturnFromLocation = (search: string, hash = ''): IVkReturn | null => {
  const query = new URLSearchParams(search.replace(/^\?/, ''));
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  const get = (key: string): string | null => query.get(key) ?? fragment.get(key);
  const payloadRaw = get('payload');
  const payload = parsePayload(payloadRaw);
  const code = text(payload?.code) ?? text(get('code'));
  const deviceId = text(payload?.device_id) ?? text(get('device_id'));
  const state = text(payload?.state) ?? text(get('state'));
  const error = text(payload?.error_description) ?? text(payload?.error) ?? text(get('error_description')) ?? text(get('error'));
  const looksLikeVk = Boolean(payloadRaw || (code && state) || (error && state && state.length >= 32));
  if (!looksLikeVk) return null;
  if (payloadRaw && !payload && !code) return { error: 'VK вернул ответ, который не удалось прочитать' };
  if (error && !code) return { error, state };
  return { code, deviceId, state };
};

/** Код VK одноразовый: второй запуск эффекта (в том числе Strict Mode) его не тратит. */
const claimedStates = new Set<string>();

export const claimVkReturn = (state: string): boolean => {
  if (claimedStates.has(state)) return false;
  claimedStates.add(state);
  return true;
};
