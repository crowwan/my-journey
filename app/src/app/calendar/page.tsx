'use client';

import { useState } from 'react';
import { useAllTrips } from '@/queries/useTrips';
import { getCalendarDays, getCalendarBars } from '@/lib/calendar-utils';
import { Header } from '@/components/layout/Header';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { MonthTripList } from '@/components/calendar/MonthTripList';

export default function CalendarPage() {
  const { data: allTrips = [] } = useAllTrips();

  // 현재 표시 월 (기본: 오늘)
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  // 이전/다음 월 이동
  const goToPrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  // 오늘 버튼
  const goToToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  // 캘린더 데이터 계산
  const calendarDays = getCalendarDays(year, month);
  const calendarBars = getCalendarBars(allTrips, year, month);

  return (
    <div className="min-h-screen bg-bg">
      <Header title="캘린더" showBack />

      <main className="max-w-[1100px] mx-auto px-5 sm:px-8">
        <CalendarHeader
          year={year}
          month={month}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />
        <CalendarGrid days={calendarDays} bars={calendarBars} />

        {/* 해당 월 여행 요약 리스트 */}
        <div className="mt-6 pb-8">
          <MonthTripList trips={allTrips} year={year} month={month} />
        </div>
      </main>
    </div>
  );
}
