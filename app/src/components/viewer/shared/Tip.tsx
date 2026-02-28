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
          ? 'bg-trip-red/10 border-trip-red/25 text-trip-red'
          : 'bg-accent-bg border-accent/20 text-accent'
      )}
    >
      {children}
    </Card>
  );
}
