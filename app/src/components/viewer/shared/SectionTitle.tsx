import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon: ReactNode;
  bgColor: string;
  children: ReactNode;
}

// 섹션 제목 — 아이콘 배경은 Tailwind 클래스(bg-*), 또는 인라인 스타일(하위 호환)
export function SectionTitle({ icon, bgColor, children }: SectionTitleProps) {
  // bgColor가 Tailwind 클래스(bg-)로 시작하면 className에, 아니면 style에
  const isTailwindClass = bgColor.startsWith('bg-');

  return (
    <div className="flex items-center gap-3 mt-10 mb-5 first:mt-0">
      <span
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${isTailwindClass ? bgColor : ''}`}
        style={isTailwindClass ? undefined : { background: bgColor }}
      >
        {icon}
      </span>
      <span className="text-lg font-semibold text-text-primary">{children}</span>
      <span className="flex-1 h-px bg-border-light" />
    </div>
  );
}
