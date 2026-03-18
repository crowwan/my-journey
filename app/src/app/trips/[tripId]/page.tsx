'use client';

import { useParams } from 'next/navigation';
import { useTrip } from '@/queries/useTrips';
import { TripViewer } from '@/components/viewer/TripViewer';
import { TripDetailSkeleton } from '@/components/shared/Skeleton';

export default function TripPage() {
  const params = useParams();
  const tripId = typeof params.tripId === 'string' ? params.tripId : '';
  const { data: trip, isLoading } = useTrip(tripId);

  // 로딩 중이면 TripViewer 모양 스켈레톤 표시
  if (isLoading || !trip) {
    return <TripDetailSkeleton />;
  }

  return <TripViewer trip={trip} />;
}
