import type { ReactNode } from 'react';

interface TipProps {
  variant?: 'tip' | 'warn';
  children: ReactNode;
}

export function Tip({ variant = 'tip', children }: TipProps) {
  const styles =
    variant === 'warn'
      ? 'bg-trip-red/10 border-trip-red/25 text-trip-red'
      : 'bg-accent/10 border-accent/25 text-accent-light';

  return (
    <div className={`${styles} border rounded-[10px] px-4 py-3 text-sm leading-relaxed`}>
      {children}
    </div>
  );
}
