'use client';

import { useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore } from '@/stores/useTripStore';
import { TripViewer } from '@/components/viewer/TripViewer';

export default function TripPage() {
  const params = useParams();
  const tripId = typeof params.tripId === 'string' ? params.tripId : '';
  const { trips, isLoaded, loadTrips } = useTripStore();

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  // trips 맵에서 직접 파생 (불필요한 useState + useEffect 제거)
  const trip = useMemo(() => trips.get(tripId) ?? null, [trips, tripId]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">여행 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return <TripViewer trip={trip} />;
}
