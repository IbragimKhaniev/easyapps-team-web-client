import {
  BookMarked,
  Bot,
  Clapperboard,
  CircleDot,
  CircleHelp,
  MessageSquare,
  RefreshCw,
  Split,
  Sparkles,
  StickyNote,
  Target,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

import {
  AgentClient,
  JournalEntryKind,
  JournalOutcome,
  JournalStatus,
  type JournalSession,
} from '@/api/models';

/**
 * Как показывать журнал работы: подписи, значки и цвета видов записей,
 * исходов и агентов. Набор значений — из swagger, здесь только вид.
 */

export interface IKindMeta {
  label: string;
  icon: LucideIcon;
  /** Значок записи: фон и цвет. */
  dot: string;
}

export const ENTRY_KIND_META: Record<JournalEntryKind, IKindMeta> = {
  prompt: { label: 'Запрос', icon: MessageSquare, dot: 'bg-slate-100 text-slate-600' },
  reply: { label: 'Ответ агента', icon: Bot, dot: 'bg-brand-50 text-brand-800' },
  step: { label: 'Шаг', icon: CircleDot, dot: 'bg-slate-100 text-slate-600' },
  decision: { label: 'Решение', icon: Split, dot: 'bg-violet-50 text-violet-700' },
  result: { label: 'Результат', icon: Target, dot: 'bg-brand-100 text-brand-800' },
  problem: { label: 'Минус', icon: TriangleAlert, dot: 'bg-rose-50 text-rose-600' },
  win: { label: 'Плюс', icon: Sparkles, dot: 'bg-emerald-50 text-emerald-700' },
  question: { label: 'Вопрос людям', icon: CircleHelp, dot: 'bg-amber-50 text-amber-700' },
  note: { label: 'Заметка', icon: StickyNote, dot: 'bg-zinc-100 text-zinc-600' },
  task: { label: 'Изменение', icon: RefreshCw, dot: 'bg-zinc-100 text-zinc-500' },
  knowledge: { label: 'В базу знаний', icon: BookMarked, dot: 'bg-brand-50 text-brand-800' },
  pipeline: { label: 'Конвейер роликов', icon: Clapperboard, dot: 'bg-violet-50 text-violet-700' },
};

export interface IPillMeta {
  label: string;
  chip: string;
}

export const OUTCOME_META: Record<JournalOutcome, IPillMeta> = {
  done: { label: 'Сделано', chip: 'bg-brand-50 text-brand-800 border-brand-200' },
  progress: { label: 'Продвинулись', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  blocked: { label: 'Упёрлись', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
  failed: { label: 'Не получилось', chip: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
};

const ACTIVE_PILL: IPillMeta = { label: 'Идёт', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
const ABANDONED_PILL: IPillMeta = { label: 'Без итога', chip: 'bg-zinc-100 text-zinc-500 border-zinc-200' };

/** Пилюля работы: идёт, без итога или исход. */
export const workPill = (session: Pick<JournalSession, 'status' | 'outcome'>): IPillMeta => {
  if (session.status === JournalStatus.active) return ACTIVE_PILL;
  if (session.status === JournalStatus.abandoned || !session.outcome) return ABANDONED_PILL;
  return OUTCOME_META[session.outcome];
};

export const AGENT_TITLES: Record<AgentClient, string> = {
  'claude-code': 'Claude Code',
  claude: 'Claude',
  codex: 'Codex',
  cursor: 'Cursor',
  other: 'Агент',
};

/** Подпись агента: версия из подключения, иначе название. */
export const agentLabel = (session: Pick<JournalSession, 'client' | 'clientLabel'>): string => {
  const title = AGENT_TITLES[session.client];
  const version = session.clientLabel?.match(/\d+(\.\d+)+/)?.[0];
  return version ? `${title} ${version}` : title;
};

/** 0 → «меньше минуты», 75 → «1 ч 15 мин». */
export const formatMinutes = (minutes: number): string => {
  if (minutes < 1) return 'меньше минуты';
  if (minutes < 60) return `${Math.round(minutes)} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
};

/** Работа без задачи из хука: человек поговорил с агентом, но работу не открыли. */
export const isConversationOnly = (session: Pick<JournalSession, 'taskId' | 'origin'>): boolean =>
  !session.taskId && session.origin === 'hook';
