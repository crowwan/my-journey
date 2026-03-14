'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CardVariant } from '@/components/home/TripCard';

interface TripHeroCardProps {
  trip: TripSummary;
  packingProgress?: { checked: number; total: number; percentage: number };
  variant?: CardVariant;
}

// 다가오는/진행 중 여행을 강조하는 히어로 카드
export function TripHeroCard({ trip, packingProgress, variant = 'A' }: TripHeroCardProps) {
  const router = useRouter();
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  // variant별 카드 컨테이너 스타일
  const containerClass = {
    A: 'bg-surface border border-border-light border-l-4 border-l-primary',
    B: 'bg-surface border border-border-light',
    C: 'bg-primary-50 border border-primary/20',
  }[variant];

  // C안 D-day 뱃지 스타일
  const ddayBadgeClass = variant === 'C'
    ? 'bg-primary-50 text-primary border border-primary/30'
    : badgeStyle;

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-md cursor-pointer p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]',
        containerClass
      )}
    >
      {/* B안: 상단 그라데이션 바 */}
      {variant === 'B' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-t-2xl" />
      )}

      {/* D-day 뱃지 */}
      <span className={cn(
        'inline-block text-xs font-bold px-3 py-1 rounded-full mb-4',
        ddayBadgeClass
      )}>
        {dday}
      </span>

      {/* 여행 제목 */}
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 leading-tight text-text-primary">
        {trip.title}
      </h2>

      {/* 날짜 + 인원 */}
      <p className="text-text-secondary text-sm mb-1">
        {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
        {' · '}
        {trip.travelers > 1 ? `${trip.travelers}명` : '혼자 여행'}
        {' · '}{trip.dayCount}일
      </p>

      {/* 태그 */}
      {trip.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 text-text-tertiary text-xs px-2.5 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 준비물 진행률 */}
      {packingProgress && packingProgress.total > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-text-tertiary">준비물</span>
            <span className="text-xs font-medium text-text-secondary">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
          <Progress
            value={packingProgress.percentage}
            className="h-1.5 bg-gray-200 [&>div]:bg-primary"
          />
        </div>
      )}
    </div>
  );
}
