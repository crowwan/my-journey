'use client';

import { useState } from 'react';
import type { Trip } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { shareTrip } from '@/lib/share-utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  trip: Trip;
  packingProgress?: { checked: number; total: number; percentage: number };
  onEdit?: () => void;
}

export function HeroSection({ trip, packingProgress, onEdit }: HeroSectionProps) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = async () => {
    const result = await shareTrip(trip);
    if (result.method === 'clipboard') {
      setToastMessage('링크가 복사되었습니다');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* 그라디언트 배경 */}
      <div className="absolute inset-0 gradient-accent-soft" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative flex items-center justify-center text-center px-5 py-10 pt-[calc(2.5rem+var(--safe-area-top,0px))]">
        <div className="w-full max-w-lg">
          {/* D-day 뱃지 */}
          <Badge className={cn('mb-4 text-xs font-semibold px-3.5 py-1 shadow-sm', badgeStyle)}>
            {dday}
          </Badge>

          <h1 className="text-3xl font-black text-text tracking-tight mb-2">
            {trip.title}
          </h1>
          <p className="text-sm text-text-secondary font-medium tracking-wide">
            {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')} ·{' '}
            {trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}
          </p>

          {/* 태그 칩 */}
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            {trip.tags.map((tag) => (
              <Badge
                key={tag}
                variant="accent"
                className="px-3 py-1 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* 준비물 진행률 */}
          {packingProgress && packingProgress.total > 0 && (
            <div className="flex items-center gap-2.5 mt-5 mx-auto max-w-xs">
              <span className="text-xs text-text-secondary font-medium">준비</span>
              <Progress value={packingProgress.percentage} className="flex-1 h-2 bg-white/60" />
              <span className="text-xs text-text-secondary font-semibold">
                {packingProgress.percentage}%
              </span>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2.5 justify-center mt-5">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-surface-elevated border border-border rounded-xl px-4 py-2.5 hover:border-accent/30 hover:text-accent shadow-[var(--shadow-sm)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              공유
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs font-semibold text-white gradient-accent rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                AI로 수정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-text text-white text-sm px-5 py-2.5 rounded-full shadow-[var(--shadow-float)] z-50 animate-slide-up">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
