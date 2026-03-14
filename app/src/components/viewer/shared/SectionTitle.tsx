import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon?: ReactNode;
  bgColor?: string;
  children: ReactNode;
}

// 섹션 제목 — 텍스트 + 구분선
export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <span className="text-sm font-semibold text-text-secondary">{children}</span>
      <span className="flex-1 h-px bg-border-light" />
    </div>
  );
}
