import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon: string;
  bgColor: string;
  children: ReactNode;
}

export function SectionTitle({ icon, bgColor, children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <div className="flex items-center gap-2.5">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm"
          style={{ background: `${bgColor}20`, border: `1px solid ${bgColor}30` }}
        >
          {icon}
        </span>
        <span className="text-lg font-bold text-text">{children}</span>
      </div>
      <span className="flex-1 h-[1px] bg-border" />
    </div>
  );
}
