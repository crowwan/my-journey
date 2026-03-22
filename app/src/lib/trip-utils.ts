import type { PackingItem } from '@/types/trip';

// 여행 상태 타입
export type TripStatus = 'upcoming' | 'ongoing' | 'completed';

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
      return 'bg-info-bg text-info border border-info/15';
    case 'ongoing':
      return 'bg-trip-green/10 text-trip-green border border-trip-green/15';
    case 'completed':
      return 'bg-surface-sunken text-text-tertiary border border-border';
  }
}
