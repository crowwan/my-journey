'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tip } from './Tip';

interface TipsAccordionProps {
  tips: string[];
  title?: string;
}

// 팁을 컴팩트 바(accordion)로 표시하는 컴포넌트
export function TipsAccordion({ tips, title = '여행 팁' }: TipsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (tips.length === 0) return null;

  return (
    <div className="mt-6">
      {/* 컴팩트 바 — 클릭으로 펼침/접힘 토글 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between',
          'rounded-xl border border-primary/20 px-4 py-3',
          'text-sm font-medium text-primary cursor-pointer',
          'hover:bg-primary-50 transition-colors'
        )}
      >
        <span>
          {title} {tips.length}개
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-primary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* 펼쳐지는 팁 목록 */}
      {isOpen && (
        <div className="space-y-2 mt-3">
          {tips.map((tip) => (
            <Tip key={tip}>{tip}</Tip>
          ))}
        </div>
      )}
    </div>
  );
}
