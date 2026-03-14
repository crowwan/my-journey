// 여행 페이지 4탭 구성
export const TAB_CONFIG = [
  { id: 'summary', label: '요약', icon: '📋' },
  { id: 'schedule', label: '일정', icon: '📅' },
  { id: 'guide', label: '가이드', icon: '🧭' },
  { id: 'checklist', label: '체크리스트', icon: '✅' },
] as const;

export type TabId = (typeof TAB_CONFIG)[number]['id'];

// Day별 테마 컬러 (지도 마커, 경로 색상에 사용)
export const DAY_COLORS = [
  '#f97316', // Day 1: orange
  '#6366f1', // Day 2: indigo
  '#10b981', // Day 3: emerald
  '#a78bfa', // Day 4: purple
  '#f472b6', // Day 5: pink
] as const;

// Day 번호에 해당하는 테마 컬러 반환 (순환)
export function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}
