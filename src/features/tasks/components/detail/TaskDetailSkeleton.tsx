/** Сколько строк свойств в карточке: статус, приоритет, исполнитель, срок, проект, метки. */
const PROPERTY_ROWS = 6;

/**
 * Заготовка карточки задачи по её раскладке: шапка, название, свойства, описание.
 * Один и тот же вид, пока грузится код карточки и пока приходит сама задача, —
 * когда одно сменяется другим, ничего не прыгает.
 */
export const TaskDetailSkeleton = () => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 px-5 py-3 md:px-6">
      <div className="skeleton h-6 w-6 rounded-lg" />
      <div className="skeleton h-4 w-16" />
      <div className="ml-auto flex items-center gap-1">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="skeleton h-8 w-8 rounded-full" />
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-6 px-5 pb-8 pt-1 md:px-6">
      <div className="skeleton h-9 w-3/4 rounded-xl" />
      <div className="flex flex-col">
        {Array.from({ length: PROPERTY_ROWS }, (_, index) => (
          <div key={index} className="flex min-h-11 items-center gap-3">
            <div className="skeleton h-4 w-24 shrink-0" />
            <div className="skeleton h-9 w-36 rounded-full" />
          </div>
        ))}
      </div>
      <div className="skeleton h-32 w-full rounded-2xl" />
    </div>
  </div>
);
