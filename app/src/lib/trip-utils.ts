import type { PackingItem, TripSummary } from '@/types/trip';

// 여행 상태 타입
export type TripStatus = 'upcoming' | 'ongoing' | 'completed';

// 여행 그룹 타입 (시간 기준 분류)
export type TripGroup = {
  upcoming: TripSummary[]; // startDate > today
  ongoing: TripSummary[];  // startDate <= today <= endDate
  past: TripSummary[];     // endDate < today
};

// 여행 목록을 시간 기준으로 그룹핑
export function groupTrips(summaries: TripSummary[]): TripGroup {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // 로컬 시간 기준 YYYY-MM-DD (toISOString()은 UTC 기준이라 KST에서 하루 전 날짜가 됨)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const group: TripGroup = { upcoming: [], ongoing: [], past: [] };

  for (const trip of summaries) {
    if (trip.endDate < todayStr) {
      group.past.push(trip);
    } else if (trip.startDate > todayStr) {
      group.upcoming.push(trip);
    } else {
      // startDate <= today <= endDate
      group.ongoing.push(trip);
    }
  }

  // upcoming: startDate 오름차순 (가까운 것 먼저)
  group.upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate));
  // past: endDate 내림차순 (최근 것 먼저)
  group.past.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return group;
}

// D-Day 계산: 여행 시작일까지 남은 일수를 문자열로 반환
export function getDDay(startDate: string, endDate: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now > end) return '완료';
  if (now >= start && now <= end) return '여행 중';

  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-Day';
  return `D-${diffDays}`;
}

// 여행 상태 판별
export function getTripStatus(startDate: string, endDate: string): TripStatus {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now > end) return 'completed';
  if (now >= start) return 'ongoing';
  return 'upcoming';
}

// 준비물 체크 진행률 계산
export function getPackingProgress(
  packing: PackingItem[] | undefined,
  checkedMap: Record<string, string[]>
): { checked: number; total: number; percentage: number } {
  if (!packing || packing.length === 0) return { checked: 0, total: 0, percentage: 0 };

  let total = 0;
  let checked = 0;

  for (const category of packing) {
    total += category.items.length;
    const checkedItems = checkedMap[category.category] || [];
    checked += checkedItems.length;
  }

  return {
    checked,
    total,
    percentage: total > 0 ? Math.round((checked / total) * 100) : 0,
  };
}

// D-Day 뱃지 스타일 (상태별 색상)
export function getDDayBadgeStyle(status: TripStatus): string {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-50 text-blue-600 border border-blue-200';
    case 'ongoing':
      return 'bg-green-50 text-green-600 border border-green-200';
    case 'completed':
      return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}
