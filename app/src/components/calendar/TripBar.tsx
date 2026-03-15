'use client';

import { useRouter } from 'next/navigation';
import type { CalendarBar } from '@/lib/calendar-utils';

interface TripBarProps {
  bar: CalendarBar;
  isHovered: boolean;
  onHover: (tripId: string | null) => void;
}

// 캘린더 셀 위에 가로로 표시되는 여행 바
export function TripBar({ bar, isHovered, onHover }: TripBarProps) {
  const router = useRouter();

  const borderRadius = [
    bar.isStart ? 'rounded-l-md' : '',
    bar.isEnd ? 'rounded-r-md' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={() => router.push(`/trips/${bar.tripId}`)}
      onMouseEnter={() => onHover(bar.tripId)}
      onMouseLeave={() => onHover(null)}
      className={`w-full h-5 text-[11px] font-medium text-white truncate px-1.5 leading-5 cursor-pointer transition-all text-left ${borderRadius}`}
      style={{
        backgroundColor: bar.color,
        filter: isHovered ? 'brightness(1.15)' : 'none',
        boxShadow: isHovered ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
      }}
    >
      {bar.isStart && <span className="truncate">{bar.title}</span>}
    </button>
  );
}
