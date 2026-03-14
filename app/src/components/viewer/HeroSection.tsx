'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import type { Trip } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { shareTrip } from '@/lib/share-utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  trip: Trip;
  packingProgress?: { checked: number; total: number; percentage: number };
}

export function HeroSection({ trip, packingProgress }: HeroSectionProps) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  // 클립보드 복사 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 공유 버튼 핸들러
  const handleShare = async () => {
    const result = await shareTrip(trip);
    if (result.method === 'clipboard') {
      setToastMessage('링크가 복사되었습니다');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-primary-50 via-primary-50/50 to-bg flex items-center justify-center text-center px-5 py-10">
      <div className="w-full max-w-lg">
        {/* D-day 뱃지 */}
        <Badge className={cn('mb-4 text-xs font-medium px-3 py-1 rounded-full shadow-xs', badgeStyle)}>
          {dday}
        </Badge>

        {/* 제목 — Playfair Display */}
        <h1 className="font-display text-4xl font-bold text-text-primary tracking-tight mb-2">
          {trip.title}
        </h1>

        {/* 날짜/인원 */}
        <p className="text-sm text-text-secondary font-light tracking-[0.15em]">
          {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')} ·{' '}
          {trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}
        </p>

        {/* 태그 — secondary(틸) 색상 */}
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {trip.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary-50 text-secondary-700 px-3 py-1 border border-secondary-200/50 text-xs font-medium rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 준비물 진행률 */}
        {packingProgress && packingProgress.total > 0 && (
          <div className="flex items-center gap-2 mt-4 mx-auto max-w-xs">
            <Progress value={packingProgress.percentage} className="flex-1 h-1.5 bg-bg-tertiary" />
            <span className="text-[11px] text-text-tertiary shrink-0">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
        )}

        {/* 공유 버튼 */}
        <div className="flex items-center gap-2 justify-center mt-5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-text-secondary border border-border rounded-full px-4 py-2 hover:bg-bg-secondary hover:text-text-primary transition-colors"
          >
            <Share2 className="size-3.5" />
            공유하기
          </button>
        </div>
      </div>

      {/* 클립보드 복사 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-text-primary text-white text-sm px-4 py-2 rounded-full shadow-lg z-[100]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
