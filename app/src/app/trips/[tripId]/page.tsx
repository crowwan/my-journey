'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTripStore } from '@/stores/useTripStore';
import { useUIStore } from '@/stores/useUIStore';
import { TripViewer } from '@/components/viewer/TripViewer';
import type { Trip } from '@/types/trip';

export default function TripPage() {
  const params = useParams();
  const tripId = typeof params.tripId === 'string' ? params.tripId : '';
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);
  const { trips, isLoaded, loadTrips } = useTripStore();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  useEffect(() => {
    const found = trips.get(tripId);
    if (found) setTrip(found);
  }, [trips, tripId]);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">여행 데이터를 불러오는 중...</div>
      </div>
    );
  }

  // AI 드로어를 편집 모드로 열기
  const handleEdit = () => {
    openAIDrawer('edit', tripId);
  };

  return <TripViewer trip={trip} onEdit={handleEdit} />;
}
