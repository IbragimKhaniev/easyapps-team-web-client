import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Тосты: снизу по центру на телефоне (над таббаром), справа снизу на компьютере. */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    offset={16}
    toastOptions={{
      classNames: {
        toast:
          'group toast rounded-2xl border border-black/[0.06] bg-white/95 text-ink shadow-float backdrop-blur-xl font-sans',
        description: 'text-ink-muted',
        actionButton: 'rounded-full bg-primary text-primary-foreground',
        cancelButton: 'rounded-full bg-secondary text-ink',
      },
    }}
    {...props}
  />
);

export { Toaster };
