/**
 * Дробные индексы порядка — та же реализация, что на сервере
 * (easyapps-web-server/src/services/team-api/core/utils/rank.ts). Нужна для
 * мгновенного переноса на доске: место считаем сразу, сервер присылает своё.
 */

/** ASCII-порядок: цифры < заглавные < строчные. */
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const ZERO = DIGITS[0];
const LAST_DIGIT = DIGITS[DIGITS.length - 1];
/** Самая маленькая целая часть: дальше вниз уходить некуда. */
const SMALLEST_INTEGER = 'A' + ZERO.repeat(26);
/** Ключ первой задачи в пустой колонке. */
const FIRST_KEY = 'a' + ZERO;

const fail = (message: string): never => {
  throw new Error(`rank: ${message}`);
};

/** Ключ строго между `a` и `b` для дробных частей (`b = null` — без верхней границы). */
const midpoint = (a: string, b: string | null): string => {
  if (b !== null && a >= b) fail(`«${a}» не меньше «${b}»`);
  if (a.endsWith(ZERO) || (b !== null && b.endsWith(ZERO))) fail('дробь не может кончаться нулём');

  if (b !== null) {
    let n = 0;
    while ((a[n] ?? ZERO) === b[n]) n++;
    if (n > 0) return b.slice(0, n) + midpoint(a.slice(n), b.slice(n));
  }

  const digitA = a ? DIGITS.indexOf(a[0]) : 0;
  const digitB = b !== null ? DIGITS.indexOf(b[0]) : DIGITS.length;
  if (digitB - digitA > 1) return DIGITS[Math.round((digitA + digitB) / 2)];
  if (b !== null && b.length > 1) return b.slice(0, 1);
  return DIGITS[digitA] + midpoint(a.slice(1), null);
};

/** Длина целой части по её первому символу: `a`→2 … `z`→27, `Z`→2 … `A`→27. */
const integerLength = (head: string): number => {
  if (head >= 'a' && head <= 'z') return head.charCodeAt(0) - 'a'.charCodeAt(0) + 2;
  if (head >= 'A' && head <= 'Z') return 'Z'.charCodeAt(0) - head.charCodeAt(0) + 2;
  return fail(`неверное начало ключа «${head}»`);
};

const integerPart = (key: string): string => {
  const length = integerLength(key[0]);
  if (length > key.length) fail(`неверный ключ «${key}»`);
  return key.slice(0, length);
};

const validateKey = (key: string): void => {
  if (key === SMALLEST_INTEGER) fail(`неверный ключ «${key}»`);
  const fraction = key.slice(integerPart(key).length);
  if (fraction.endsWith(ZERO)) fail(`неверный ключ «${key}»`);
};

const incrementInteger = (value: string): string | null => {
  const [head, ...digits] = value.split('');
  let carry = true;
  for (let i = digits.length - 1; carry && i >= 0; i--) {
    const next = DIGITS.indexOf(digits[i]) + 1;
    if (next === DIGITS.length) {
      digits[i] = ZERO;
    } else {
      digits[i] = DIGITS[next];
      carry = false;
    }
  }
  if (!carry) return head + digits.join('');
  if (head === 'Z') return 'a' + ZERO;
  if (head === 'z') return null;
  const nextHead = String.fromCharCode(head.charCodeAt(0) + 1);
  if (nextHead > 'a') digits.push(ZERO);
  else digits.pop();
  return nextHead + digits.join('');
};

const decrementInteger = (value: string): string | null => {
  const [head, ...digits] = value.split('');
  let borrow = true;
  for (let i = digits.length - 1; borrow && i >= 0; i--) {
    const prev = DIGITS.indexOf(digits[i]) - 1;
    if (prev === -1) {
      digits[i] = LAST_DIGIT;
    } else {
      digits[i] = DIGITS[prev];
      borrow = false;
    }
  }
  if (!borrow) return head + digits.join('');
  if (head === 'a') return 'Z' + LAST_DIGIT;
  if (head === 'A') return null;
  const prevHead = String.fromCharCode(head.charCodeAt(0) - 1);
  if (prevHead < 'Z') digits.push(LAST_DIGIT);
  else digits.pop();
  return prevHead + digits.join('');
};

/**
 * Ключ для места между соседями.
 *
 * @param prev ключ задачи выше (нет — ставим в начало)
 * @param next ключ задачи ниже (нет — ставим в конец)
 */
export const rankBetween = (prev?: string | null, next?: string | null): string => {
  const a = prev ?? null;
  const b = next ?? null;
  if (a !== null) validateKey(a);
  if (b !== null) validateKey(b);
  if (a !== null && b !== null && a >= b) fail(`«${a}» не меньше «${b}»`);

  if (a === null) {
    if (b === null) return FIRST_KEY;
    const intB = integerPart(b);
    const fracB = b.slice(intB.length);
    if (intB === SMALLEST_INTEGER) return intB + midpoint('', fracB);
    if (intB < b) return intB;
    return decrementInteger(intB) ?? fail('ниже ставить некуда');
  }

  const intA = integerPart(a);
  const fracA = a.slice(intA.length);

  if (b === null) {
    return incrementInteger(intA) ?? intA + midpoint(fracA, null);
  }

  const intB = integerPart(b);
  const fracB = b.slice(intB.length);
  if (intA === intB) return intA + midpoint(fracA, fracB);
  const incremented = incrementInteger(intA) ?? fail('выше ставить некуда');
  if (incremented < b) return incremented;
  return intA + midpoint(fracA, null);
};

/** Ключ после последнего — новая задача в конец колонки. */
export const rankAfter = (last?: string | null): string => rankBetween(last, null);

/** Ключ перед первым — задача в начало колонки. */
export const rankBefore = (first?: string | null): string => rankBetween(null, first);
