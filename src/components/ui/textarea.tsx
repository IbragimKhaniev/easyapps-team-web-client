import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldClassName } from './input';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClassName, 'min-h-[96px] py-3 leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
