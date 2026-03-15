'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

// 캘린더 상단 헤더: 월 표시 + 이전/다음 네비게이션 + 오늘 버튼
export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4">
      {/* 연/월 표시 */}
      <h2 className="text-xl font-semibold text-text-primary">
        {year}년 {month}월
      </h2>

      {/* 네비게이션 버튼 그룹 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="text-sm font-medium text-primary-500 px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
        >
          오늘
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={onNextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="다음 달"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
