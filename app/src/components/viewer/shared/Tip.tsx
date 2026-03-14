import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TipProps {
  variant?: 'tip' | 'warn';
  children: ReactNode;
}

export function Tip({ variant = 'tip', children }: TipProps) {
  return (
    <Card
      className={cn(
        'rounded-xl border px-4 py-3.5 text-sm leading-relaxed shadow-none gap-0',
        variant === 'warn'
          ? 'bg-error/10 border-error/25 text-error'
          : 'bg-primary-50 border-primary/20 text-primary'
      )}
    >
      {children}
    </Card>
  );
}
