import { LogOut, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';

import type { Integration } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { useIntegrationActions } from '../hooks/useIntegrationActions';

type TStep = 'phone' | 'code';

interface ITelegramMtprotoSectionProps {
  integration: Integration;
  actions: ReturnType<typeof useIntegrationActions>;
}

/**
 * Вход аккаунтом администратора канала (MTProto) — статистика канала и видео
 * больше 50 МБ. Код приходит в Telegram; его нельзя пересылать в чаты —
 * Telegram сразу его гасит, поэтому вводят здесь, руками.
 */
export const TelegramMtprotoSection = ({ integration, actions }: ITelegramMtprotoSectionProps) => {
  const [step, setStep] = useState<TStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [viaApp, setViaApp] = useState(true);
  const apiReady = Boolean(integration.settings.apiId) && Boolean(integration.secrets.apiHash);

  if (integration.mtprotoConnected) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
        <span className="min-w-0 flex-1 text-[13.5px] text-emerald-900">
          Аккаунт подключён{integration.mtprotoUser ? `: ${integration.mtprotoUser}` : ''} — статистика канала и большие видео идут через него.
        </span>
        <Button variant="ghost" size="sm" onClick={() => void actions.signOut()}>
          <LogOut /> Выйти
        </Button>
      </div>
    );
  }

  if (!apiReady) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 px-4 py-3 text-[13px] leading-snug text-ink-muted">
        Чтобы войти аккаунтом администратора (точная статистика, видео до 2 ГБ), сохраните api_id и api_hash с my.telegram.org.
      </p>
    );
  }

  const request = async () => {
    const result = await actions.requestCode(phone.trim());
    if (!result) return;
    setViaApp(result.viaApp);
    setStep('code');
  };

  const confirm = async () => {
    const result = await actions.confirmCode(phone.trim(), code.trim(), password);
    if (result?.mtprotoConnected) {
      setStep('phone');
      setCode('');
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-secondary p-4">
      <div className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
        <Smartphone className="h-4 w-4 text-brand-800" /> Вход аккаунтом администратора канала
      </div>
      {step === 'phone' ? (
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void request(); }}>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+79991234567" inputMode="tel" autoComplete="tel" className="bg-white" />
          <Button type="submit" disabled={actions.signingIn || phone.trim().length < 8}>Прислать код</Button>
        </form>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={(event) => { event.preventDefault(); void confirm(); }}>
          <p className="text-[12.5px] text-ink-muted">
            Код отправлен {viaApp ? 'в приложение Telegram на этом аккаунте' : 'по SMS'}. Не пересылайте его — введите здесь.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Код" inputMode="numeric" autoComplete="one-time-code" className="w-32 bg-white" />
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Облачный пароль (если есть)" autoComplete="current-password" className="min-w-[200px] flex-1 bg-white" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={actions.signingIn || code.trim().length < 4}>Войти</Button>
            <Button type="button" variant="ghost" onClick={() => setStep('phone')}>Другой номер</Button>
          </div>
        </form>
      )}
    </div>
  );
};
