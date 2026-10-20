import {
  BarChart3,
  BookOpen,
  Boxes,
  Camera,
  Clapperboard,
  Code2,
  GraduationCap,
  Gavel,
  Globe,
  Handshake,
  Heart,
  Lightbulb,
  Link2,
  ListOrdered,
  Megaphone,
  Mic,
  Palette,
  PenLine,
  Rocket,
  Shield,
  ShoppingBag,
  Sparkles,
  Sigma,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { KnowledgeKind } from '@/api/models';

/**
 * Вид базы знаний: значки разделов (сервер хранит имя из набора
 * `KNOWLEDGE_SECTION_ICONS` team-api) и подписи видов записей.
 */

export const SECTION_ICONS: Record<string, LucideIcon> = {
  Megaphone,
  Target,
  PenLine,
  Clapperboard,
  Palette,
  Boxes,
  Code2,
  Handshake,
  BarChart3,
  Users,
  BookOpen,
  Lightbulb,
  Rocket,
  ShoppingBag,
  GraduationCap,
  Globe,
  Mic,
  Camera,
  Heart,
  Shield,
};

/** Значок раздела по имени; незнакомое имя — книга. */
export const sectionIcon = (name: string): LucideIcon => SECTION_ICONS[name] ?? BookOpen;

export interface IKnowledgeKindMeta {
  label: string;
  hint: string;
  icon: LucideIcon;
  chip: string;
}

export const KIND_META: Record<KnowledgeKind, IKnowledgeKindMeta> = {
  rule: { label: 'Правило', hint: 'Как у нас принято — применять всегда', icon: Gavel, chip: 'bg-brand-50 text-brand-800 border-brand-200' },
  insight: { label: 'Вывод', hint: 'Что сработало или нет и почему', icon: Sparkles, chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  fact: { label: 'Цифры', hint: 'Данные, бенчмарки, факты', icon: Sigma, chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  howto: { label: 'Инструкция', hint: 'Пошагово, как сделать', icon: ListOrdered, chip: 'bg-violet-50 text-violet-700 border-violet-200' },
  decision: { label: 'Решение', hint: 'Что решили и почему', icon: Lightbulb, chip: 'bg-sky-50 text-sky-800 border-sky-200' },
  resource: { label: 'Материал', hint: 'Ссылка, шаблон, файл', icon: Link2, chip: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
};

export const KIND_ORDER: KnowledgeKind[] = [
  KnowledgeKind.rule,
  KnowledgeKind.insight,
  KnowledgeKind.fact,
  KnowledgeKind.howto,
  KnowledgeKind.decision,
  KnowledgeKind.resource,
];

/**
 * Начало текста без разметки — для карточки в списке. Снимаем только разметку:
 * дефисы и подчёркивания внутри слов («что-то», start_work) остаются.
 */
export const plainPreview = (markdown: string, max = 220): string => {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^ {0,3}([-*_])(?: *\1){2,} *$/gm, ' ')
    .replace(/^ {0,3}(?:#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__|~~)(\S(?:[\s\S]*?\S)?)\1/g, '$2')
    .replace(/(^|[^\p{L}\p{N}_])[*_](\S(?:[^*_]*?\S)?)[*_](?![\p{L}\p{N}_])/gu, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/** Метки из строки ввода: «vk, рилсы ,Тон» → ['vk', 'рилсы', 'тон']. */
export const parseTags = (raw: string): string[] =>
  [...new Set(raw.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
