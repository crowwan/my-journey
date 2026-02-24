'use client';

import { useEffect } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { TripCard } from '@/components/home/TripCard';
import { NewTripButton } from '@/components/home/NewTripButton';

export default function Home() {
  const { isLoaded, loadTrips, loadSeedData, getTripSummaries } = useTripStore();

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
      loadSeedData();
    }
  }, [isLoaded, loadTrips, loadSeedData]);

  const trips = getTripSummaries();

  return (
    <div className="min-h-screen pb-[var(--bottom-nav-h)]">
      <Header title="My Journey" />
      <main className="max-w-[1100px] mx-auto px-4 py-6">
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <NewTripButton />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
