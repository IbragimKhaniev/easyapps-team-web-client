import type { Integration } from '@/api/models';

/**
 * Черновик формы площадки и то, что из него уходит на сервер. Секреты с
 * сервера не приходят — в черновике только те, что человек решил заменить.
 */
export interface IFieldDraft {
  /** Несекретные поля: строкой, как в поле ввода. */
  settings: Record<string, string>;
  /** Секреты, которые решили заменить: ключ есть — поле открыто (пустое значение не отправляется). */
  secrets: Record<string, string>;
}

export const draftOf = (integration: Integration): IFieldDraft => ({
  settings: Object.fromEntries(
    integration.fields
      .filter((field) => field.type !== 'secret')
      .map((field) => [field.key, integration.settings[field.key] === null || integration.settings[field.key] === undefined ? '' : String(integration.settings[field.key])]),
  ),
  secrets: {},
});

/** Что изменилось в форме — тело PUT: только тронутые поля. */
export const changesOf = (integration: Integration, draft: IFieldDraft) => {
  const initial = draftOf(integration);
  const settings = Object.fromEntries(
    Object.entries(draft.settings).filter(([key, value]) => value !== initial.settings[key]).map(([key, value]) => [key, value.trim() === '' ? null : value.trim()]),
  );
  // Секрет, который открыли для замены, но оставили пустым, — не трогаем (стирать — отдельной кнопкой не даём).
  const secrets = Object.fromEntries(Object.entries(draft.secrets).filter(([, value]) => value.trim() !== '').map(([key, value]) => [key, value.trim()]));
  return {
    settings: Object.keys(settings).length ? settings : undefined,
    secrets: Object.keys(secrets).length ? secrets : undefined,
  };
};
