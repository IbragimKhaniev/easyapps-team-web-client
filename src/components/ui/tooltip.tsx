import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * Тултип проекта — один на все экраны.
 *
 * Вид сдержанный, в духе Apple: тёмная полупрозрачная плашка с размытием под
 * ней, белый текст 12px, мягкая многослойная тень и тонкая светлая кромка,
 * быстрое появление без лишнего движения. В тёмной теме плашка светлее фона —
 * как всплывающие подсказки в macOS.
 *
 * Всегда в портале (body) и на верхнем слое. Без портала тултип срезал бы
 * любой предок с overflow-hidden, если тот держит у себя fixed-позиционирование
 * (backdrop-blur, transform, filter) — так было над полем ввода чата. Слой
 * выше всего, что бывает рядом: диалоги z-[70]/z-[80], Select z-[100], поповеры
 * и меню z-[200] (тултипы бывают и внутри них), плавающий AI-чат z-[1000].
 * Пока открыт модальный диалог, на body висит pointer-events: none — на тултип
 * это не влияет: он только показывается, наводить на него не нужно.
 */

/** Задержка показа: быстрее стандартных 700 мс Radix, но без мельтешения при проходе курсором. */
const DEFAULT_DELAY_MS = 400;

const TooltipProvider = ({
  delayDuration = DEFAULT_DELAY_MS,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);
TooltipProvider.displayName = TooltipPrimitive.Provider.displayName;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, collisionPadding = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-[1100] max-w-[280px] select-none rounded-[10px] px-2.5 py-1.5",
        "text-xs font-medium leading-[1.4] text-white text-pretty",
        "bg-[rgba(28,28,30,0.9)] backdrop-blur-xl backdrop-saturate-150",
        "ring-1 ring-inset ring-white/10 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45),0_2px_8px_-2px_rgba(0,0,0,0.18)]",
        "dark:bg-[rgba(64,64,68,0.92)] dark:ring-white/[0.14]",
        // Вторичный текст внутри (подписи вроде «AI:», причины блокировки) —
        // приглушённо-белый: серый из темы на тёмной плашке почти не читался бы.
        "[&_.text-muted-foreground]:text-white/60",
        "origin-[var(--radix-tooltip-content-transform-origin)]",
        "animate-in fade-in-0 zoom-in-95 duration-150 ease-out",
        "data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100",
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
