import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TipProps {
  variant?: 'tip' | 'warn';
  children: ReactNode;
}

export function Tip({ variant = 'tip', children }: TipProps) {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3.5 text-sm leading-relaxed flex items-start gap-2.5',
        variant === 'warn'
          ? 'bg-error/5 border border-error/15 text-error'
          : 'bg-accent-bg border border-accent/15 text-accent-warm'
      )}
    >
      <span className="shrink-0 text-base mt-[-1px]">{variant === 'warn' ? '⚠️' : '💡'}</span>
      <span>{children}</span>
    </div>
  );
}
