'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  gap?: string;
}

// 수평 스크롤 컨테이너 (CSS scroll-snap 적용)
export function HorizontalScroll({
  children,
  className,
  gap = 'gap-4',
}: HorizontalScrollProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto snap-x snap-mandatory',
        'scrollbar-hide',
        'px-5 sm:px-8',
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}
