import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Кнопки — капсулы, как в референсе: основная залита глубоким фирменным
 * голубым, второстепенная — контур, тихая — без фона. Нажатие слегка
 * «проседает» (как на iPhone), фокус с клавиатуры — кольцо бренда.
 */
const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
    'transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.97] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-lift hover:bg-brand-900',
        brand: 'bg-brand text-white hover:bg-brand-600',
        outline: 'border border-ink/80 bg-transparent text-ink hover:bg-ink hover:text-white',
        soft: 'bg-secondary text-ink hover:bg-ink/[0.08]',
        ghost: 'text-ink-soft hover:bg-ink/[0.06] hover:text-ink',
        white: 'bg-white text-ink shadow-card hover:bg-white/90',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'h-auto rounded-none px-0 text-brand-800 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3.5 text-[13px] [&_svg]:size-4',
        md: 'h-10 px-5 text-sm [&_svg]:size-[18px]',
        lg: 'h-12 px-6 text-[15px] [&_svg]:size-5',
        icon: 'h-10 w-10 [&_svg]:size-5',
        'icon-sm': 'h-8 w-8 [&_svg]:size-4',
        'icon-lg': 'h-12 w-12 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
