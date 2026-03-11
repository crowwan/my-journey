'use client';

import { useEffect, useState } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { getPackingProgress } from '@/lib/trip-utils';
import { Header } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TripCard } from '@/components/home/TripCard';
import { NewTripButton } from '@/components/home/NewTripButton';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return '좋은 아침이에요 ☀️';
  if (hour >= 12 && hour <= 17) return '좋은 오후예요 🌤️';
  if (hour >= 18 && hour <= 22) return '좋은 저녁이에요 🌙';
  return '늦은 밤이에요 🌛';
}

export default function Home() {
  const { isLoaded, loadTrips, getTripSummaries } = useTripStore();
  const trips = useTripStore((s) => s.trips);
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('splashShown');
  });

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  const summaries = getTripSummaries();

  if (showSplash) {
    return <SplashScreen onFinish={() => {
      sessionStorage.setItem('splashShown', '1');
      setShowSplash(false);
    }} />;
  }

  return (
    <div>
      <Header title="My Journey" />

      {/* 시간대별 인사말 */}
      <section className="max-w-[1100px] mx-auto px-5 pt-6 pb-2">
        <p className="text-lg font-medium text-text">{getGreeting()}</p>
        <p className="text-sm text-text-secondary">오늘도 좋은 여행을!</p>
      </section>

      {/* 컴팩트 헤더 */}
      <section className="max-w-[1100px] mx-auto px-5 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-text">내 여행</h2>
            <span className="text-sm text-text-tertiary">{summaries.length}</span>
          </div>
          <NewTripButton />
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-5 pb-8">
        <div className="flex flex-col gap-4">
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
      {/* 빌드 버전 */}
      <footer className="max-w-[1100px] mx-auto px-5 pb-4 text-center">
        <p className="text-[10px] text-text-tertiary">
          Build {process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7)} · {process.env.NEXT_PUBLIC_BUILD_TIME?.slice(0, 16).replace('T', ' ')}
        </p>
      </footer>
    </div>
  );
}
