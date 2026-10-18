import * as React from 'react';

import { cn } from '@/lib/utils';

/** Поле — мягкий серый фон без рамки, при фокусе белое с кольцом бренда. */
export const fieldClassName =
  'w-full rounded-xl border border-transparent bg-secondary px-3.5 text-[15px] text-ink placeholder:text-ink-faint ' +
  'transition-colors focus-visible:border-brand/40 focus-visible:bg-white focus-visible:outline-none ' +
  'focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldClassName, 'h-11', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export { Input };
