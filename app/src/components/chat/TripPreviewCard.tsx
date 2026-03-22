'use client';

import { useRouter } from 'next/navigation';
import type { Trip } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';
import { Badge } from '@/components/ui/badge';

interface TripPreviewCardProps {
  trip: Trip;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function TripPreviewCard({ trip }: TripPreviewCardProps) {
  const router = useRouter();
  const saveTrip = useTripStore((s) => s.saveTrip);

  const handleSave = () => {
    saveTrip(trip);
    router.push(`/trips/${trip.id}`);
  };

  return (
    <div className="bg-surface-elevated border border-border rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* 헤더 바 */}
      <div className="gradient-accent-soft px-4 py-3 border-b border-border">
        <h3 className="text-text font-bold text-sm">{trip.title}</h3>
        <p className="text-text-secondary text-xs mt-0.5">
          {trip.destination} &middot; {formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.days.length}일
        </p>
      </div>

      <div className="p-4 space-y-3">
        {trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trip.tags.map((tag) => (
              <Badge
                key={tag}
                variant="accent"
                className="text-[0.65rem] px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full gradient-accent text-white rounded-xl py-2.5 text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
        >
          여행 저장하기
        </button>
      </div>
    </div>
  );
}
