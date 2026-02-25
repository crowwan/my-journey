'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';

interface TripCardProps {
  trip: TripSummary;
  index?: number;
  packingProgress?: { checked: number; total: number; percentage: number };
}

export function TripCard({ trip, index = 0, packingProgress }: TripCardProps) {
  const router = useRouter();
  const initial = trip.title.charAt(0);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="group relative bg-card rounded-[14px] p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] animate-stagger-reveal border border-border hover:border-accent/20 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        {/* 이니셜 */}
        <div className="shrink-0 w-11 h-11 rounded-xl bg-accent/[0.07] border border-accent/[0.1] flex items-center justify-center">
          <span className="font-bold text-lg text-accent/80">
            {initial}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-semibold text-text group-hover:text-accent-light transition-colors duration-300 truncate">
              {trip.title}
            </h3>
            <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeStyle}`}>
              {dday}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
            {trip.travelers > 1 ? ` · ${trip.travelers}명` : ' · 혼자 여행'}
            {' · '}{trip.dayCount}일
          </p>
        </div>

        {/* Chevron */}
        <svg className="shrink-0 w-5 h-5 text-text-tertiary group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* 준비물 진행률 */}
      {packingProgress && packingProgress.total > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent/60 rounded-full transition-all duration-500"
              style={{ width: `${packingProgress.percentage}%` }}
            />
          </div>
          <span className="text-[11px] text-text-tertiary shrink-0">
            {packingProgress.checked}/{packingProgress.total}
          </span>
        </div>
      )}
    </div>
  );
}
