import { KeyRound } from 'lucide-react';

import type { Integration, IntegrationField } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { IFieldDraft } from '../lib/fieldDraft';

interface IIntegrationFieldsProps {
  integration: Integration;
  draft: IFieldDraft;
  onChange: (draft: IFieldDraft) => void;
  disabled?: boolean;
}

const SecretField = ({ field, hint, value, editing, onEdit, onChange, disabled }: {
  field: IntegrationField;
  hint: string | null;
  value: string;
  editing: boolean;
  onEdit: (editing: boolean) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  if (!editing && hint) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-xl bg-secondary px-3.5">
        <KeyRound className="h-4 w-4 text-emerald-600" />
        <span className="flex-1 text-[14px] font-semibold text-ink tabular">Задан {hint}</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(true)} disabled={disabled}>Заменить</Button>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <Input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder ?? 'Вставьте значение'}
        disabled={disabled}
      />
      {hint && (
        <Button type="button" variant="ghost" onClick={() => onEdit(false)} disabled={disabled}>Отмена</Button>
      )}
    </div>
  );
};

/**
 * Форма площадки по её описанию с сервера (`fields`): обычные поля и
 * секреты. Секрет не возвращается — видно только «хвост» и кнопку «Заменить».
 */
export const IntegrationFields = ({ integration, draft, onChange, disabled }: IIntegrationFieldsProps) => (
  <div className="flex flex-col gap-4">
    {integration.fields.map((field) => {
      const isSecret = field.type === 'secret';
      const hint = isSecret ? integration.secrets[field.key] ?? null : null;
      return (
        <label key={field.key} className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </span>
          {isSecret ? (
            <SecretField
              field={field}
              hint={hint}
              value={draft.secrets[field.key] ?? ''}
              editing={field.key in draft.secrets}
              disabled={disabled}
              onEdit={(editing) => {
                const secrets = { ...draft.secrets };
                if (editing) secrets[field.key] = '';
                else delete secrets[field.key];
                onChange({ ...draft, secrets });
              }}
              onChange={(value) => onChange({ ...draft, secrets: { ...draft.secrets, [field.key]: value } })}
            />
          ) : (
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              inputMode={field.type === 'number' ? 'numeric' : undefined}
              value={draft.settings[field.key] ?? ''}
              onChange={(event) => onChange({ ...draft, settings: { ...draft.settings, [field.key]: event.target.value } })}
              placeholder={field.placeholder}
              disabled={disabled}
            />
          )}
          {field.hint && <span className="text-[12px] leading-snug text-ink-muted">{field.hint}</span>}
        </label>
      );
    })}
  </div>
);
