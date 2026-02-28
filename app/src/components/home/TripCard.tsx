'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
    <Card
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="group cursor-pointer p-5 gap-0 rounded-[16px] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] animate-stagger-reveal hover:border-accent/20 hover:shadow-[var(--shadow-card-hover)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3.5">
          {/* 이니셜 */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-accent-bg border border-accent/[0.1] flex items-center justify-center">
            <span className="font-bold text-lg text-accent/80">
              {initial}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-base font-bold text-text group-hover:text-accent-light transition-colors duration-300 truncate">
                {trip.title}
              </h3>
              <Badge className={cn('shrink-0 text-[11px] font-medium', badgeStyle)}>
                {dday}
              </Badge>
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
            <Progress value={packingProgress.percentage} className="flex-1 h-1.5 bg-gray-100" />
            <span className="text-[11px] text-text-tertiary shrink-0">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
