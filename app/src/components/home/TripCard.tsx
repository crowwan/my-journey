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

// 목적지 이모지 그라디언트 배경
const DESTINATION_GRADIENTS = [
  'from-orange-400 to-amber-300',
  'from-blue-400 to-cyan-300',
  'from-emerald-400 to-teal-300',
  'from-purple-400 to-indigo-300',
  'from-pink-400 to-rose-300',
];

export function TripCard({ trip, index = 0, packingProgress }: TripCardProps) {
  const router = useRouter();
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  const firstGrapheme = segmenter.segment(trip.title)[Symbol.iterator]().next().value?.segment ?? '';
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(firstGrapheme);
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);
  const gradientBg = DESTINATION_GRADIENTS[index % DESTINATION_GRADIENTS.length];

  return (
    <Card
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="group cursor-pointer p-0 gap-0 rounded-2xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] animate-stagger-reveal hover:shadow-[var(--shadow-card-hover)] overflow-hidden border-border"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardContent className="p-0">
        {/* 상단 비주얼 영역 */}
        <div className={`relative h-24 bg-gradient-to-br ${gradientBg} flex items-center justify-center overflow-hidden`}>
          <span className={`${isEmoji ? 'text-4xl' : 'text-3xl font-black text-white/80'} group-hover:scale-110 transition-transform duration-300`}>
            {firstGrapheme}
          </span>
          {/* D-Day 뱃지 오버레이 */}
          <Badge className={cn('absolute top-3 right-3 text-[11px] font-semibold shadow-sm', badgeStyle)}>
            {dday}
          </Badge>
        </div>

        {/* 하단 정보 */}
        <div className="p-4">
          <h3 className="text-[15px] font-bold text-text group-hover:text-accent transition-colors duration-200 mb-1">
            {trip.title}
          </h3>
          <p className="text-[13px] text-text-secondary">
            {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
            {trip.travelers > 1 ? ` · ${trip.travelers}명` : ' · 혼자 여행'}
            {' · '}{trip.dayCount}일
          </p>

          {/* 준비물 진행률 */}
          {packingProgress && packingProgress.total > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Progress value={packingProgress.percentage} className="flex-1 h-1.5 bg-surface-sunken" />
              <span className="text-[11px] text-text-tertiary shrink-0 font-medium">
                {packingProgress.checked}/{packingProgress.total}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
