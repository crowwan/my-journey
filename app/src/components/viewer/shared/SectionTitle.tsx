import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon: string;
  bgColor: string;
  children: ReactNode;
}

export function SectionTitle({ icon, bgColor, children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <span
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-base shrink-0"
        style={{ background: bgColor }}
      >
        {icon}
      </span>
      <span className="text-lg font-bold text-text">{children}</span>
      <span className="flex-1 h-[1px] bg-border" />
    </div>
  );
}
