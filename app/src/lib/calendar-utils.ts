import type { Trip } from '@/types/trip';

// 캘린더 그리드의 날짜 셀 정보
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number; // 날짜 숫자
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean; // 토/일
}

// 캘린더에 표시할 여행 바 정보
export interface CalendarBar {
  tripId: string;
  title: string;
  color: string;
  startCol: number; // 1~7 (일~토)
  endCol: number; // 1~7
  weekIndex: number; // 몇 번째 주 (0부터)
  row: number; // 같은 주 내 세로 위치 (0, 1, 2...)
  isStart: boolean; // 바의 시작 (왼쪽 둥글게)
  isEnd: boolean; // 바의 끝 (오른쪽 둥글게)
}

// 로컬 날짜를 YYYY-MM-DD 문자열로 변환
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// 오늘 날짜 문자열 (로컬 기준)
function getTodayStr(): string {
  const now = new Date();
  return toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// 해당 월의 캘린더 그리드 날짜 배열 반환
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const todayStr = getTodayStr();
  const days: CalendarDay[] = [];

  // 해당 월의 첫날 요일 (0=일, 6=토)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // 해당 월의 마지막 날짜
  const daysInMonth = new Date(year, month, 0).getDate();
  // 이전 월의 마지막 날짜
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  // 이전 월 날짜 채우기
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = toDateStr(prevYear, prevMonth, d);
    const dayOfWeek = new Date(prevYear, prevMonth - 1, d).getDay();
    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // 현재 월 날짜
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateStr(year, month, d);
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // 다음 월 날짜로 마지막 주 채우기
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dateStr = toDateStr(nextYear, nextMonth, d);
      const dayOfWeek = new Date(nextYear, nextMonth - 1, d).getDay();
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
  }

  return days;
}

// 기본 색상 (primary)
const DEFAULT_COLOR = '#f97316';

// Trip 배열과 현재 월을 받아 CalendarBar 배열 반환
export function getCalendarBars(trips: Trip[], year: number, month: number): CalendarBar[] {
  const calendarDays = getCalendarDays(year, month);
  const totalWeeks = calendarDays.length / 7;

  // 월의 첫날/마지막날
  const monthStart = toDateStr(year, month, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthEnd = toDateStr(year, month, daysInMonth);

  // 현재 월과 겹치는 Trip 필터링
  const overlappingTrips = trips.filter(
    (trip) => trip.startDate <= monthEnd && trip.endDate >= monthStart
  );

  // 각 Trip을 주(week) 단위로 분할하여 바 생성
  const rawBars: Omit<CalendarBar, 'row'>[] = [];

  for (const trip of overlappingTrips) {
    const color = trip.days[0]?.color ?? DEFAULT_COLOR;

    // 이 Trip의 캘린더 내 실제 시작/끝 날짜 (월 범위로 클리핑)
    const effectiveStart = trip.startDate < monthStart ? monthStart : trip.startDate;
    const effectiveEnd = trip.endDate > monthEnd ? monthEnd : trip.endDate;

    // 각 주별로 바 분할
    for (let week = 0; week < totalWeeks; week++) {
      const weekStartIdx = week * 7;
      const weekEndIdx = weekStartIdx + 6;
      const weekStartDate = calendarDays[weekStartIdx].date;
      const weekEndDate = calendarDays[weekEndIdx].date;

      // 이 주와 여행 기간이 겹치는지 확인
      if (effectiveStart > weekEndDate || effectiveEnd < weekStartDate) continue;

      // 이 주 내에서 바의 시작/끝 컬럼 계산
      const barStartDate = effectiveStart > weekStartDate ? effectiveStart : weekStartDate;
      const barEndDate = effectiveEnd < weekEndDate ? effectiveEnd : weekEndDate;

      // 날짜 → 컬럼 번호 (1~7)
      const startCol = calendarDays.findIndex((d) => d.date === barStartDate) - weekStartIdx + 1;
      const endCol = calendarDays.findIndex((d) => d.date === barEndDate) - weekStartIdx + 1;

      rawBars.push({
        tripId: trip.id,
        title: trip.title,
        color,
        startCol,
        endCol,
        weekIndex: week,
        isStart: barStartDate === trip.startDate,
        isEnd: barEndDate === trip.endDate,
      });
    }
  }

  // 같은 주 내 row 인덱스 할당 (세로 쌓기)
  const bars: CalendarBar[] = [];
  const weekRowMap = new Map<number, number>(); // weekIndex → 다음 사용 가능한 row

  for (const bar of rawBars) {
    const currentRow = weekRowMap.get(bar.weekIndex) ?? 0;
    bars.push({ ...bar, row: currentRow });
    weekRowMap.set(bar.weekIndex, currentRow + 1);
  }

  return bars;
}
