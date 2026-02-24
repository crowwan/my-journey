import type { ReactNode } from 'react';

interface SectionTitleProps {
  icon: string;
  bgColor: string;
  children: ReactNode;
}

export function SectionTitle({ icon, bgColor, children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2.5 mt-8 mb-4 first:mt-0 text-lg font-bold text-white">
      <span
        className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-base shrink-0"
        style={{ background: bgColor }}
      >
        {icon}
      </span>
      {children}
    </div>
  );
}
