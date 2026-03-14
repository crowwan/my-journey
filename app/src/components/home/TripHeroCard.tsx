'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus } from '@/lib/trip-utils';
import { Progress } from '@/components/ui/progress';

interface TripHeroCardProps {
  trip: TripSummary;
  packingProgress?: { checked: number; total: number; percentage: number };
}

// 다가오는/진행 중 여행을 강조하는 히어로 카드
export function TripHeroCard({ trip, packingProgress }: TripHeroCardProps) {
  const router = useRouter();
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="relative overflow-hidden rounded-2xl shadow-md cursor-pointer bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* D-day 뱃지 */}
      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
        {dday}
      </span>

      {/* 여행 제목 */}
      <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 leading-tight">
        {trip.title}
      </h2>

      {/* 날짜 + 인원 */}
      <p className="text-white/80 text-sm mb-1">
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
              className="bg-white/15 text-white/90 text-xs px-2.5 py-0.5 rounded-full"
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
            <span className="text-xs text-white/70">준비물</span>
            <span className="text-xs font-medium text-white/90">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
          <Progress
            value={packingProgress.percentage}
            className="h-1.5 bg-white/20 [&>div]:bg-white"
          />
        </div>
      )}
    </div>
  );
}
