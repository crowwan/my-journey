'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 디자인 비교용 variant 타입
export type CardVariant = 'A' | 'B' | 'C';

interface TripCardProps {
  trip: TripSummary;
  index?: number;
  variant?: CardVariant;
}

// 세로 스크롤용 풀 너비 카드
export function TripCard({ trip, index = 0, variant = 'A' }: TripCardProps) {
  const router = useRouter();
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  const firstGrapheme = segmenter.segment(trip.title)[Symbol.iterator]().next().value?.segment ?? '';
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(firstGrapheme);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  // 다가오는/진행 중 여행에만 variant 스타일 적용
  const isActive = status === 'upcoming' || status === 'ongoing';

  // variant별 카드 스타일
  const variantCardClass = isActive
    ? {
        A: 'border-l-4 border-l-primary',
        B: '',
        C: 'bg-primary-50 border-primary/20',
      }[variant]
    : '';

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className={cn(
        'rounded-xl shadow-sm bg-surface border border-border-light p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] animate-stagger-reveal',
        variantCardClass
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* B안: 상단 그라데이션 바 */}
      {variant === 'B' && isActive && (
        <div className="h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full -mt-4 -mx-4 mb-4" />
      )}

      <div className="flex items-center gap-3">
        {/* 이니셜 아이콘 */}
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary/10 flex items-center justify-center flex-shrink-0">
          <span className={isEmoji ? 'text-2xl' : 'font-bold text-lg text-primary/80'}>
            {firstGrapheme}
          </span>
        </div>

        {/* 가운데: 제목, 날짜, 태그 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {trip.title}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
          </p>
          {trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {trip.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-text-tertiary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: D-day 뱃지 */}
        <Badge className={cn('text-[10px] font-medium flex-shrink-0', badgeStyle)}>
          {dday}
        </Badge>
      </div>
    </div>
  );
}
