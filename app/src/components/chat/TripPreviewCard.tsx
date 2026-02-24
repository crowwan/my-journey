'use client';

import { useRouter } from 'next/navigation';
import type { Trip } from '@/types/trip';
import { useTripStore } from '@/stores/useTripStore';

interface TripPreviewCardProps {
  trip: Trip;
}

// 날짜 범위를 읽기 좋은 형식으로 변환
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
    <div className="bg-card-secondary border border-accent/30 rounded-[14px] p-4 space-y-3">
      {/* 제목 + 목적지 */}
      <div>
        <h3 className="text-white font-bold text-sm">{trip.title}</h3>
        <p className="text-text-secondary text-xs mt-0.5">
          {trip.destination} &middot; {formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.days.length}일
        </p>
      </div>

      {/* 태그 */}
      {trip.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {trip.tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.65rem] px-2 py-0.5 bg-accent/10 text-accent rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="w-full bg-accent text-white text-sm font-medium py-2 rounded-xl hover:bg-accent-light transition-colors"
      >
        여행 저장하기
      </button>
    </div>
  );
}
