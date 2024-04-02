import { cn } from '@/lib/utils';
import React from 'react';

// import { MdContentCopy as ContentCopyIcon } from 'react-icons/md';

type MdxCodeBlockProps = {
  'data-filename'?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function MdxCodeBlock({
  className,
  style,
  children,
  'data-filename': filename,
  ...restProps
}: MdxCodeBlockProps) {
  return (
    <div className="relative mb-4 rounded-sm" {...restProps}>
      {filename && (
        <div className="relative flex rounded-t-sm border-b-2 border-neutral-300 bg-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="grow self-center text-sm text-muted-foreground">
            {filename}
          </div>
        </div>
      )}

      <div className="relative">
        <pre
          className={cn(
            'ligatures-none flex overflow-auto rounded-sm font-mono text-sm font-normal leading-relaxed',
            className,
            filename ? 'rounded-t-none' : '',
          )}
          style={style}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}
