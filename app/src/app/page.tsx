'use client';

import { useEffect } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { getPackingProgress } from '@/lib/trip-utils';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { TripCard } from '@/components/home/TripCard';
import { NewTripButton } from '@/components/home/NewTripButton';

export default function Home() {
  const { isLoaded, loadTrips, loadSeedData, getTripSummaries } = useTripStore();
  const trips = useTripStore((s) => s.trips);

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
      loadSeedData();
    }
  }, [isLoaded, loadTrips, loadSeedData]);

  const summaries = getTripSummaries();

  return (
    <div className="min-h-screen pb-[var(--bottom-nav-h)]">
      <Header title="My Journey" />

      {/* 컴팩트 헤더 */}
      <section className="max-w-[1100px] mx-auto px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold text-text">내 여행</h2>
            <span className="text-sm text-text-tertiary">{summaries.length}</span>
          </div>
          <NewTripButton />
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-4 pb-6">
        <div className="flex flex-col gap-3">
          {summaries.map((summary, index) => {
            const fullTrip = trips.get(summary.id);
            const checkedMap = storage.getPackingChecked(summary.id);
            const packingProgress = getPackingProgress(fullTrip?.packing, checkedMap);
            return (
              <TripCard
                key={summary.id}
                trip={summary}
                index={index}
                packingProgress={packingProgress}
              />
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
