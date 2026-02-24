import type { ReactNode } from 'react';

export function InfoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
      {children}
    </div>
  );
}
