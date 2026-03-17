'use client';

import { useParams } from 'next/navigation';
import { useTrip } from '@/queries/useTrips';
import { TripViewer } from '@/components/viewer/TripViewer';

export default function TripPage() {
  const params = useParams();
  const tripId = typeof params.tripId === 'string' ? params.tripId : '';
  const { data: trip } = useTrip(tripId);

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">여행 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return <TripViewer trip={trip} />;
}
