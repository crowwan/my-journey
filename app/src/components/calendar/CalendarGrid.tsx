'use client';

import { useState } from 'react';
import type { CalendarDay, CalendarBar } from '@/lib/calendar-utils';
import { TripBar } from './TripBar';

interface CalendarGridProps {
  days: CalendarDay[];
  bars: CalendarBar[];
}

// 요일 헤더 라벨
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 해당 주의 최대 row 수 계산 (셀 높이 동적 결정용)
function getMaxRows(bars: CalendarBar[], weekIndex: number): number {
  const weekBars = bars.filter((b) => b.weekIndex === weekIndex);
  if (weekBars.length === 0) return 0;
  return Math.max(...weekBars.map((b) => b.row)) + 1;
}

// 월간 캘린더 7열 그리드
export function CalendarGrid({ days, bars }: CalendarGridProps) {
  const weeks = Math.ceil(days.length / 7);
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null);

  return (
    <div className="border border-border-light rounded-xl overflow-hidden">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-border-light">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 || i === 6 ? 'text-text-tertiary' : 'text-text-secondary'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 주별 행 */}
      {Array.from({ length: weeks }, (_, weekIdx) => {
        const weekDays = days.slice(weekIdx * 7, weekIdx * 7 + 7);
        const weekBars = bars.filter((b) => b.weekIndex === weekIdx);
        const maxRows = getMaxRows(bars, weekIdx);
        // 날짜 헤더 28px + 바 영역 (각 22px) + 여백 8px
        const minHeight = Math.max(80, 28 + maxRows * 22 + 8);

        return (
          <div key={weekIdx} className="relative">
            {/* 날짜 셀 그리드 */}
            <div className="grid grid-cols-7 border-b border-border-light last:border-b-0">
              {weekDays.map((d) => (
                <div
                  key={d.date}
                  style={{ minHeight }}
                  className={`p-1 border-r border-border-light last:border-r-0 ${
                    d.isWeekend ? 'bg-bg-secondary' : 'bg-bg'
                  }`}
                >
                  {/* 날짜 숫자 */}
                  <div className="flex justify-center">
                    <span
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                        d.isToday
                          ? 'bg-primary-500 text-white font-bold'
                          : d.isCurrentMonth
                            ? 'text-text-primary'
                            : 'text-text-tertiary'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 여행 바 (절대 위치로 셀 위에 겹치기) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative grid grid-cols-7 h-full">
                {weekBars.map((bar, i) => (
                  <div
                    key={`${bar.tripId}-${weekIdx}-${i}`}
                    className="pointer-events-auto"
                    style={{
                      gridColumn: `${bar.startCol} / ${bar.endCol + 1}`,
                      position: 'absolute',
                      top: `${28 + bar.row * 22}px`,
                      left: bar.startCol === 1 ? '2px' : '1px',
                      right: bar.endCol === 7 ? '2px' : '1px',
                    }}
                  >
                    <TripBar
                      bar={bar}
                      isHovered={hoveredTripId === bar.tripId}
                      onHover={setHoveredTripId}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
