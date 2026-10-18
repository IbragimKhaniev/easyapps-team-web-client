import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

/** Описание и комментарии — markdown (списки, ссылки, таблицы, код). Ссылки — в новой вкладке. */
export const Markdown = ({ children, className }: { children: string; className?: string }) => (
  <div
    className={cn(
      'prose prose-sm max-w-none text-ink prose-headings:font-bold prose-a:text-brand-800 prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:before:content-none prose-code:after:content-none prose-li:my-0.5 prose-p:my-1.5',
      className,
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
