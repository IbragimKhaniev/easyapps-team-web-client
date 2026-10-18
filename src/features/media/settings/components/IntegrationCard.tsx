import { AlertTriangle, ChevronDown, CircleAlert, Loader2, PlugZap, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Integration } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatLongDate, timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '../../components/PlatformIcon';
import { formatCompact } from '../../lib/format';
import type { useIntegrationActions } from '../hooks/useIntegrationActions';
import { PLATFORM_GUIDES } from '../lib/guides';
import { changesOf, draftOf, type IFieldDraft } from '../lib/fieldDraft';
import { IntegrationFields } from './IntegrationFields';
import { IntegrationStatusPill } from './IntegrationStatusPill';
import { TelegramMtprotoSection } from './TelegramMtprotoSection';

interface IIntegrationCardProps {
  integration: Integration;
  actions: ReturnType<typeof useIntegrationActions>;
}

/** Площадка в «Площадках»: включить, ключи, проверка, аккаунт, предупреждения и как подключить. */
export const IntegrationCard = ({ integration, actions }: IIntegrationCardProps) => {
  const [draft, setDraft] = useState<IFieldDraft>(() => draftOf(integration));
  const [guideOpen, setGuideOpen] = useState(integration.status === 'not_configured');

  useEffect(() => setDraft(draftOf(integration)), [integration]);

  const changes = changesOf(integration, draft);
  const dirty = Boolean(changes.settings || changes.secrets);
  const { platform } = integration;

  const save = async () => {
    const result = await actions.save(platform, changes);
    // Ключи поменялись у включённой площадки — сразу проверить, что она отвечает.
    if (result?.enabled) await actions.check(platform);
  };

  const toggle = async (enabled: boolean) => {
    const result = await actions.save(platform, { enabled });
    if (result?.enabled) await actions.check(platform);
  };

  return (
    <section className="card-surface flex flex-col gap-5 p-5 lg:p-6">
      <header className="flex items-start gap-3">
        <PlatformIcon platform={platform} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[19px] font-bold tracking-tight text-ink">{integration.title}</h2>
            <IntegrationStatusPill status={integration.status} enabled={integration.enabled} />
          </div>
          <p className="mt-0.5 truncate text-[13px] text-ink-muted">
            {integration.account?.title
              ? `${integration.account.title}${integration.account.handle ? ` · ${integration.account.handle}` : ''}${integration.account.followers !== null ? ` · ${formatCompact(integration.account.followers)} подписчиков` : ''}`
              : 'Аккаунт появится после проверки подключения'}
          </p>
        </div>
        <Switch checked={integration.enabled} onCheckedChange={(enabled) => void toggle(enabled)} disabled={actions.saving} aria-label="Площадка включена" />
      </header>

      {integration.lastError && (
        <div className="flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] leading-snug text-rose-800">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {integration.lastError}
        </div>
      )}
      {integration.lastWarning && (
        <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {integration.lastWarning}
        </div>
      )}
      {!integration.canStoreSecrets && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          На сервере не задан ключ шифрования TEAM_SECRETS_KEY — ключи площадок сохранить нельзя.
        </div>
      )}

      <IntegrationFields integration={integration} draft={draft} onChange={setDraft} disabled={actions.saving} />

      {platform === 'telegram' && <TelegramMtprotoSection integration={integration} actions={actions} />}

      {platform === 'instagram' && integration.tokenExpiresAt && (
        <p className="text-[12.5px] text-ink-muted">Токен действует до {formatLongDate(integration.tokenExpiresAt.slice(0, 10))} — продлевается сам раз в неделю.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-ink-faint">{integration.lastCheckedAt ? `Проверено ${timeAgo(integration.lastCheckedAt)}` : 'Ещё не проверялось'}</span>
        <div className="flex gap-2">
          <Button variant="soft" onClick={() => void actions.check(platform)} disabled={actions.checking}>
            {actions.checking ? <Loader2 className="animate-spin" /> : <PlugZap />} Проверить
          </Button>
          <Button onClick={() => void save()} disabled={!dirty || actions.saving}>
            {actions.saving ? <Loader2 className="animate-spin" /> : <Save />} Сохранить
          </Button>
        </div>
      </div>

      <div className="border-t border-black/[0.06] pt-3">
        <button type="button" onClick={() => setGuideOpen((open) => !open)} className="flex w-full items-center justify-between text-[13.5px] font-bold text-ink">
          Как подключить {integration.title}
          <ChevronDown className={cn('h-4 w-4 transition-transform', guideOpen && 'rotate-180')} />
        </button>
        {guideOpen && (
          <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-[13px] leading-snug text-ink-soft">
            {PLATFORM_GUIDES[platform].map((step) => <li key={step}>{step}</li>)}
          </ol>
        )}
      </div>
    </section>
  );
};
