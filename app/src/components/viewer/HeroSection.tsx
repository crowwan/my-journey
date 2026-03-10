import type { Trip } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';
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

  return (
    <div className="bg-gradient-to-b from-accent-bg to-white flex items-center justify-center text-center px-5 py-8">
      <div className="w-full max-w-lg">
        {/* D-day 뱃지 */}
        <Badge className={cn('mb-4 text-xs font-medium px-3 py-1', badgeStyle)}>
          {dday}
        </Badge>

        <h1 className="text-3xl font-black text-text tracking-tight mb-2">
          {trip.title}
        </h1>
        <p className="text-sm text-text-secondary font-light tracking-[0.15em]">
          {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')} ·{' '}
          {trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}
        </p>
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {trip.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-accent-bg text-accent px-3 py-1 border border-accent/15 text-xs font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 준비물 진행률 */}
        {packingProgress && packingProgress.total > 0 && (
          <div className="flex items-center gap-2 mt-4 mx-auto max-w-xs">
            <Progress value={packingProgress.percentage} className="flex-1 h-1.5 bg-gray-100" />
            <span className="text-[11px] text-text-tertiary shrink-0">
              {packingProgress.checked}/{packingProgress.total}
            </span>
          </div>
        )}

        {/* AI 수정 버튼 */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="mt-4 flex items-center gap-1.5 mx-auto text-xs text-accent border border-accent/20 bg-accent-bg rounded-full px-4 py-2 hover:bg-accent-bg-hover transition-colors"
          >
            <span>✏️</span>
            AI로 수정하기
          </button>
        )}
      </div>
    </div>
  );
}
