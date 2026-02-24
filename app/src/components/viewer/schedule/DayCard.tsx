'use client';

import { useState } from 'react';
import type { Day } from '@/types/trip';
import { TimelineItemComponent } from './TimelineItem';

interface DayCardProps {
  day: Day;
  defaultOpen?: boolean;
}

export function DayCard({ day, defaultOpen = false }: DayCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card border border-border rounded-[14px] mb-4 overflow-visible">
      {/* 헤더 - 클릭 시 토글 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3.5 px-5 py-[18px] cursor-pointer transition-colors hover:bg-glass"
      >
        <div
          className="w-11 h-11 rounded-[11px] flex items-center justify-center text-base font-black text-white shrink-0"
          style={{ background: day.color }}
        >
          {day.dayNumber}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{day.title}</h3>
          <p className="text-sm text-text-secondary mt-0.5">
            {day.date.replace(/-/g, '.')} · {day.subtitle}
          </p>
        </div>
        <span
          className={`ml-auto text-text-tertiary text-sm shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </div>

      {/* 타임라인 본문 */}
      {isOpen && (
        <div className="px-5 pb-5 animate-fade-up">
          {/* 지도는 추후 추가 예정 */}
          <div className="timeline">
            {day.items.map((item, idx) => (
              <TimelineItemComponent key={idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
