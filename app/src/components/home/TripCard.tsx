'use client';

import { useRouter } from 'next/navigation';
import type { TripSummary } from '@/types/trip';

interface TripCardProps {
  trip: TripSummary;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="bg-card border border-border rounded-[14px] p-5 cursor-pointer transition-all hover:border-accent/30 hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{trip.title}</h3>
        <span className="text-sm text-text-tertiary shrink-0 ml-2">
          {trip.dayCount}일
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-3">
        {trip.startDate.replace(/-/g, '.')} — {trip.endDate.replace(/-/g, '.')}
        {trip.travelers > 1 ? ` \u00B7 ${trip.travelers}명` : ' \u00B7 혼자 여행'}
      </p>
      <div className="flex gap-2 flex-wrap">
        {trip.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
