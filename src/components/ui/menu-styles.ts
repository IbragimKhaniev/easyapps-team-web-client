/**
 * Один вид всплывающих меню на весь проект: дропдауны (`dropdown-menu`),
 * выпадающие списки (`select`) и контекстные меню (`context-menu`) берут
 * классы отсюда, поэтому выглядят и двигаются одинаково.
 *
 * Вид — в духе меню macOS и iOS: полупрозрачная поверхность с размытием под
 * ней, скругление 12px, волосяная кромка и мягкая многослойная тень; пункты
 * 13px со скруглённой серой подсветкой, галочка выбранного — слева, подписи
 * разделов — мелкие серые, разделители — с отступом от краёв. Появление
 * быстрое, от точки привязки к кнопке.
 *
 * Слой z-[1050]: выше диалогов (z-[70]/z-[80]), поповеров (z-[200]) и
 * плавающего AI-чата (z-[1000]) — меню открываются и внутри них; ниже только
 * тултипа (z-[1100]), который бывает у пунктов меню.
 */

/** Поверхность меню. */
export const MENU_CONTENT =
  "z-[1050] min-w-[11rem] overflow-hidden rounded-xl border border-black/[0.07] bg-popover/95 p-1 text-popover-foreground " +
  "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.24),0_4px_14px_-6px_rgba(0,0,0,0.1)] backdrop-blur-xl backdrop-saturate-150 " +
  "dark:border-white/[0.09] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7),0_4px_14px_-6px_rgba(0,0,0,0.45)]";

/** Появление и исчезновение: короткий fade + лёгкий масштаб от точки привязки. */
export const MENU_ANIMATION =
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:duration-150 " +
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100 " +
  "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1";

/** Пункт меню. Подсветка — по фокусу клавиатуры и наведению (Radix ставит data-highlighted). */
export const MENU_ITEM =
  "relative flex cursor-default select-none items-center rounded-lg px-2.5 py-1.5 text-[13px] leading-5 outline-none transition-colors " +
  "focus:bg-foreground/[0.06] data-[highlighted]:bg-foreground/[0.06] " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-45 [&>svg]:shrink-0";

/** Пункт с галочкой слева (выбор в списке, флажки, радио). */
export const MENU_ITEM_WITH_INDICATOR = "pl-8";

/** Место галочки у пункта. */
export const MENU_INDICATOR = "absolute left-2.5 flex h-4 w-4 items-center justify-center";

/** Подпись раздела — мелкая и серая, как заголовки групп в меню macOS. */
export const MENU_LABEL = "px-2.5 pb-1 pt-1.5 text-[11px] font-medium leading-4 text-muted-foreground";

/** Разделитель групп — с отступом от краёв. */
export const MENU_SEPARATOR = "mx-2 my-1 h-px bg-foreground/[0.08]";

/** Сочетание клавиш справа у пункта. */
export const MENU_SHORTCUT = "ml-auto pl-4 text-[11px] tracking-wide text-muted-foreground";
