import type { Trip } from '@/types/trip';
import { getDDay, getTripStatus, getDDayBadgeStyle } from '@/lib/trip-utils';

interface HeroSectionProps {
  trip: Trip;
  packingProgress?: { checked: number; total: number; percentage: number };
}

export function HeroSection({ trip, packingProgress }: HeroSectionProps) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  const dday = getDDay(trip.startDate, trip.endDate);
  const badgeStyle = getDDayBadgeStyle(status);

  return (
    <div className="bg-card flex items-center justify-center text-center px-5 py-6">
      <div className="w-full max-w-lg">
        {/* D-day 뱃지 */}
        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-3 ${badgeStyle}`}>
          {dday}
        </span>

        <h1 className="text-2xl font-black text-text tracking-tight mb-2">
          {trip.title}
        </h1>
        <p className="text-sm text-text-secondary font-light tracking-[0.15em]">
          {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')} ·{' '}
          {trip.travelers === 1 ? '혼자 여행' : `${trip.travelers}명`}
        </p>
        <div className="flex gap-2 justify-center flex-wrap mt-4">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="bg-accent/[0.07] text-accent px-3 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 준비물 진행률 */}
        {packingProgress && packingProgress.total > 0 && (
          <div className="flex items-center gap-2 mt-4 mx-auto max-w-xs">
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
    </div>
  );
}
