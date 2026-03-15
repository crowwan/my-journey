import { describe, it, expect } from 'vitest';
import { getCalendarBars, getCalendarDays } from '../calendar-utils';

// ============================================================
// getCalendarDays 테스트
// ============================================================
describe('getCalendarDays', () => {
  it('해당 월의 모든 날짜를 포함한 배열을 반환한다', () => {
    const days = getCalendarDays(2026, 4); // 2026년 4월
    // 4월은 30일
    const aprilDays = days.filter((d) => d.isCurrentMonth);
    expect(aprilDays).toHaveLength(30);
  });

  it('첫 번째 날의 요일에 맞춰 이전 월 날짜를 채운다', () => {
    // 2026년 4월 1일은 수요일 (요일 인덱스 3)
    const days = getCalendarDays(2026, 4);
    // 일~화(3칸)가 이전 월
    const prevMonthDays = days.filter((d) => !d.isCurrentMonth && d.date < '2026-04-01');
    expect(prevMonthDays).toHaveLength(3);
  });

  it('마지막 날 뒤에 다음 월 날짜를 채워 완전한 주를 만든다', () => {
    const days = getCalendarDays(2026, 4);
    // 총 날짜 수가 7의 배수여야 함
    expect(days.length % 7).toBe(0);
  });

  it('오늘 날짜를 정확히 표시한다', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const days = getCalendarDays(year, month);
    const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDay = days.find((d) => d.date === todayStr);
    expect(todayDay?.isToday).toBe(true);
  });

  it('주말(토/일)을 정확히 표시한다', () => {
    const days = getCalendarDays(2026, 4);
    // 2026-04-05는 일요일(0)... 아니다, 4월1일이 수요일이면 4월5일은 일요일
    const april5 = days.find((d) => d.date === '2026-04-05');
    expect(april5?.isWeekend).toBe(true);
  });
});

// ============================================================
// getCalendarBars 테스트
// ============================================================
describe('getCalendarBars', () => {
  // 테스트용 Trip 데이터 (최소한의 필드만)
  const makeTrip = (id: string, startDate: string, endDate: string, title: string, color?: string) => ({
    id,
    title,
    destination: title,
    startDate,
    endDate,
    travelers: 1,
    tags: [],
    overview: { flights: [], accommodation: { name: '', address: '', area: '', nearbyStations: [] }, weather: [], tips: [] },
    days: color ? [{ dayNumber: 1, date: startDate, title: '', subtitle: '', color, items: [], mapSpots: [] }] : [],
    restaurants: [],
    transport: { homeToHotel: [], intercityRoutes: [], passes: [], passVerdict: '', tips: [] },
    budget: { items: [], total: { min: '', max: '', minKRW: '', maxKRW: '' }, tips: [] },
    packing: [],
    preTodos: [],
    createdAt: '',
    updatedAt: '',
  });

  it('해당 월과 겹치지 않는 여행은 반환하지 않는다', () => {
    const trips = [makeTrip('1', '2026-05-01', '2026-05-05', '도쿄')];
    const bars = getCalendarBars(trips, 2026, 4);
    expect(bars).toHaveLength(0);
  });

  it('해당 월 내에 완전히 포함되는 여행을 바로 변환한다', () => {
    const trips = [makeTrip('1', '2026-04-07', '2026-04-10', '도쿄', '#f97316')];
    const bars = getCalendarBars(trips, 2026, 4);
    expect(bars.length).toBeGreaterThanOrEqual(1);
    expect(bars[0].tripId).toBe('1');
    expect(bars[0].title).toBe('도쿄');
  });

  it('주를 넘어가는 여행은 여러 바로 분할한다', () => {
    // 2026-04-10(금) ~ 2026-04-14(화): 2주에 걸침
    const trips = [makeTrip('1', '2026-04-10', '2026-04-14', '방콕', '#10b981')];
    const bars = getCalendarBars(trips, 2026, 4);
    expect(bars.length).toBe(2); // 2주에 걸침 → 2개 바
  });

  it('바의 isStart/isEnd가 정확히 설정된다', () => {
    // 2026-04-10(금) ~ 2026-04-14(화): 2주에 걸침
    const trips = [makeTrip('1', '2026-04-10', '2026-04-14', '방콕', '#10b981')];
    const bars = getCalendarBars(trips, 2026, 4);
    // 첫 번째 바: 시작 O, 끝 X
    expect(bars[0].isStart).toBe(true);
    expect(bars[0].isEnd).toBe(false);
    // 두 번째 바: 시작 X, 끝 O
    expect(bars[1].isStart).toBe(false);
    expect(bars[1].isEnd).toBe(true);
  });

  it('같은 주에 여러 여행이 있으면 row 인덱스를 다르게 할당한다', () => {
    const trips = [
      makeTrip('1', '2026-04-07', '2026-04-08', '도쿄', '#f97316'),
      makeTrip('2', '2026-04-09', '2026-04-10', '오사카', '#6366f1'),
    ];
    const bars = getCalendarBars(trips, 2026, 4);
    // 같은 주에 2개 → row가 0, 1
    const weekBars = bars.filter((b) => b.weekIndex === bars[0].weekIndex);
    const rows = weekBars.map((b) => b.row);
    expect(new Set(rows).size).toBe(rows.length); // 중복 없음
  });

  it('월을 넘어가는 여행은 해당 월 범위만 표시한다', () => {
    // 3월 28일 ~ 4월 3일 (4월에는 1~3일만)
    const trips = [makeTrip('1', '2026-03-28', '2026-04-03', '제주', '#f97316')];
    const bars = getCalendarBars(trips, 2026, 4);
    expect(bars.length).toBeGreaterThanOrEqual(1);
    // 모든 바의 startCol이 1~7 범위
    bars.forEach((bar) => {
      expect(bar.startCol).toBeGreaterThanOrEqual(1);
      expect(bar.endCol).toBeLessThanOrEqual(7);
    });
  });

  it('days 배열이 비어있으면 기본 색상(primary)을 사용한다', () => {
    const trips = [makeTrip('1', '2026-04-07', '2026-04-08', '도쿄')]; // color 없음
    const bars = getCalendarBars(trips, 2026, 4);
    expect(bars[0].color).toBe('#f97316'); // primary 기본값
  });
});
