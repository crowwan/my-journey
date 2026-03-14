'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

// 빈 상태 표시 컴포넌트 (여행 없을 때, 데이터 없을 때 재사용)
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-5', className)}>
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary text-center mb-6">{description}</p>
      {action}
    </div>
  );
}
