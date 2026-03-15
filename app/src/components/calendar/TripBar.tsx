'use client';

import { useRouter } from 'next/navigation';
import type { CalendarBar } from '@/lib/calendar-utils';

interface TripBarProps {
  bar: CalendarBar;
}

// 캘린더 셀 위에 가로로 표시되는 여행 바
export function TripBar({ bar }: TripBarProps) {
  const router = useRouter();

  // 시작/끝에 따른 모서리 둥글기
  const borderRadius = [
    bar.isStart ? 'rounded-l-md' : '',
    bar.isEnd ? 'rounded-r-md' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={() => router.push(`/trips/${bar.tripId}`)}
      className={`w-full h-5 text-[11px] font-medium text-white truncate px-1.5 leading-5 cursor-pointer hover:brightness-110 transition-all text-left ${borderRadius}`}
      style={{ backgroundColor: bar.color }}
    >
      {/* 시작 바에만 제목 표시 (모바일에서는 숨김) */}
      {bar.isStart && <span className="sm:inline hidden">{bar.title}</span>}
    </button>
  );
}
