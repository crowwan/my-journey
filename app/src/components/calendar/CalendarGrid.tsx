'use client';

import type { CalendarDay, CalendarBar } from '@/lib/calendar-utils';
import { TripBar } from './TripBar';

interface CalendarGridProps {
  days: CalendarDay[];
  bars: CalendarBar[];
}

// 요일 헤더 라벨
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 같은 주, 3개 초과 바가 있을 때 "+N개" 표시를 위한 계산
function getOverflowCount(bars: CalendarBar[], weekIndex: number): number {
  const weekBars = bars.filter((b) => b.weekIndex === weekIndex);
  const maxRow = Math.max(...weekBars.map((b) => b.row), -1);
  return maxRow >= 3 ? maxRow - 2 : 0;
}

// 월간 캘린더 7열 그리드
export function CalendarGrid({ days, bars }: CalendarGridProps) {
  const weeks = Math.ceil(days.length / 7);

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
        const weekBars = bars.filter(
          (b) => b.weekIndex === weekIdx && b.row < 3
        );
        const overflow = getOverflowCount(bars, weekIdx);

        return (
          <div key={weekIdx} className="relative">
            {/* 날짜 셀 그리드 */}
            <div className="grid grid-cols-7 border-b border-border-light last:border-b-0">
              {weekDays.map((d) => (
                <div
                  key={d.date}
                  className={`min-h-[80px] sm:min-h-[100px] p-1 border-r border-border-light last:border-r-0 ${
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
                      top: `${24 + bar.row * 22}px`,
                      left: bar.startCol === 1 ? '2px' : '1px',
                      right: bar.endCol === 7 ? '2px' : '1px',
                    }}
                  >
                    <TripBar bar={bar} />
                  </div>
                ))}

                {/* 초과 바 표시 */}
                {overflow > 0 && (
                  <div
                    className="absolute text-[10px] text-text-tertiary font-medium pointer-events-auto"
                    style={{
                      top: `${24 + 3 * 22}px`,
                      left: '4px',
                    }}
                  >
                    +{overflow}개
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
