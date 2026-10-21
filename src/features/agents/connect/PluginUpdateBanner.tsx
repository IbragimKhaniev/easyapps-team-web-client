import { Check, CircleAlert, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useGetAgentsTeamStatus, useListAgentKeys } from '@/api/generated/agents/agents';
import { PluginStatus } from '@/api/models';
import { Button } from '@/components/ui/button';

/**
 * На моём компьютере плагин устарел — сказать об этом здесь и дать команду
 * обновления. Агент попросит о том же сам в начале работы.
 */
export const PluginUpdateBanner = () => {
  const { data: keys } = useListAgentKeys();
  const { data: team } = useGetAgentsTeamStatus();
  const [copied, setCopied] = useState(false);
  const outdated = (keys?.data ?? []).filter((key) => key.pluginStatus === PluginStatus.outdated);
  const status = team?.data;
  if (!outdated.length || !status) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(status.updateCommand);
    setCopied(true);
    toast.success('Команда скопирована — вставьте её в Терминал');
  };

  return (
    <div className="mx-4 mb-4 flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-4 lg:mx-0 lg:mb-5">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="text-[15px] font-bold text-amber-950">Вышла новая версия плагина — {status.latestPluginVersion}</div>
        <p className="text-[13.5px] leading-snug text-amber-900">
          У вас стоит старая: {outdated.map((key) => `${key.host ?? key.name} — ${key.pluginVersion}`).join(', ')}. Агент попросит
          обновиться сам в начале работы, а можно сейчас — одна команда в Терминале:
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 break-all rounded-xl bg-white/80 px-3 py-2 font-mono text-[12.5px] text-ink">{status.updateCommand}</code>
          <Button variant="white" size="sm" onClick={() => void copy()}>
            {copied ? <Check /> : <Copy />} {copied ? 'Скопировано' : 'Скопировать'}
          </Button>
        </div>
        <p className="text-[12.5px] text-amber-900/80">Или скажите агенту «обнови плагин easyapps team». Новая версия заработает в новом разговоре.</p>
      </div>
    </div>
  );
};
