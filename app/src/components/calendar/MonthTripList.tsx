'use client';

import Link from 'next/link';
import type { Trip } from '@/types/trip';
import { MapPin, CalendarDays, Users } from 'lucide-react';

interface MonthTripListProps {
  trips: Trip[];
  year: number;
  month: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function diffDays(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// 해당 월과 겹치는 여행 필터링
function getMonthTrips(trips: Trip[], year: number, month: number): Trip[] {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  return trips
    .filter((trip) => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      return tripStart <= monthEnd && tripEnd >= monthStart;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function MonthTripList({ trips, year, month }: MonthTripListProps) {
  const monthTrips = getMonthTrips(trips, year, month);

  if (monthTrips.length === 0) {
    return (
      <div className="text-center py-10 text-text-tertiary">
        <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">이번 달 여행 계획이 없어요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
        <MapPin size={14} className="text-primary" />
        {month}월 여행
        <span className="text-text-tertiary font-normal">{monthTrips.length}</span>
      </h3>

      <div className="space-y-2">
        {monthTrips.map((trip) => {
          const color = trip.days[0]?.color ?? '#f97316';
          const days = diffDays(trip.startDate, trip.endDate);
          const nights = days - 1;

          return (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border-light hover:border-primary/30 hover:shadow-sm transition-all"
            >
              {/* 컬러 바 */}
              <div
                className="w-1 h-10 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {trip.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <span>{formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}</span>
                  <span className="text-text-tertiary">·</span>
                  <span>{nights > 0 ? `${nights}박 ${days}일` : '당일'}</span>
                  <span className="text-text-tertiary">·</span>
                  <span className="flex items-center gap-0.5">
                    <Users size={10} />
                    {trip.travelers}명
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
