'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: TripSummary;
  index?: number;
}

// 수평 스크롤용 미니 카드
export function TripCard({ trip, index = 0 }: TripCardProps) {
  const router = useRouter();
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  const firstGrapheme = segmenter.segment(trip.title)[Symbol.iterator]().next().value?.segment ?? '';
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(firstGrapheme);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="flex-shrink-0 w-[200px] rounded-xl shadow-sm bg-surface border border-border-light p-4 snap-start cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] animate-stagger-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 이니셜 아이콘 */}
      <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary/10 flex items-center justify-center mb-3">
        <span className={isEmoji ? 'text-2xl' : 'font-bold text-lg text-primary/80'}>
          {firstGrapheme}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-semibold text-text-primary truncate mb-1">
        {trip.title}
      </h3>

      {/* 날짜 */}
      <p className="text-xs text-text-secondary mb-2">
        {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
      </p>

      {/* D-day 뱃지 */}
      <Badge className={cn('text-[10px] font-medium', badgeStyle)}>
        {dday}
      </Badge>
    </div>
  );
}
