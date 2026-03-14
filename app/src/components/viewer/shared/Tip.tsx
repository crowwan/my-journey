import type { ReactNode } from 'react';
import { Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipProps {
  variant?: 'tip' | 'warn';
  children: ReactNode;
}

export function Tip({ variant = 'tip', children }: TipProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3.5 text-sm leading-relaxed flex items-start gap-2.5',
        variant === 'warn'
          ? 'bg-error/5 border-error/20 text-error'
          : 'bg-primary-50 border-primary/15 text-text-secondary'
      )}
    >
      {variant === 'warn' ? (
        <AlertTriangle className="size-4 shrink-0 mt-0.5 text-error" />
      ) : (
        <Lightbulb className="size-4 shrink-0 mt-0.5 text-primary" />
      )}
      <span>{children}</span>
    </div>
  );
}
