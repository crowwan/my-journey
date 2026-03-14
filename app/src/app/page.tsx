'use client';

import { useEffect, useState } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { getPackingProgress, groupTrips } from '@/lib/trip-utils';
import { Header } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TripCard } from '@/components/home/TripCard';
import { TripHeroCard } from '@/components/home/TripHeroCard';
import { NewTripButton } from '@/components/home/NewTripButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { CardVariant } from '@/components/home/TripCard';

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
  const [showSplash, setShowSplash] = useState(true);
  const [variant, setVariant] = useState<CardVariant>('A');

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  const summaries = getTripSummaries();
  const { upcoming, ongoing, past } = groupTrips(summaries);

  // 히어로에 표시할 여행: ongoing 우선, 없으면 upcoming 첫번째
  const heroTrip = ongoing[0] ?? upcoming[0] ?? null;
  // 히어로에 표시된 여행은 리스트에서 제외
  const remainingUpcoming = heroTrip
    ? upcoming.filter((t) => t.id !== heroTrip.id)
    : upcoming;
  const remainingOngoing = heroTrip
    ? ongoing.filter((t) => t.id !== heroTrip.id)
    : ongoing;

  // 히어로 카드용 준비물 진행률
  const heroPackingProgress = heroTrip
    ? (() => {
        const fullTrip = trips.get(heroTrip.id);
        const checkedMap = storage.getPackingChecked(heroTrip.id);
        return getPackingProgress(fullTrip?.packing, checkedMap);
      })()
    : undefined;

  // 부제 결정
  function getSubtitle(): string {
    if (ongoing.length > 0) return '여행 중이시네요!';
    if (upcoming.length > 0) return '다가오는 여행이 있어요!';
    if (past.length > 0) return '새로운 여행을 계획해볼까요?';
    return '첫 여행을 계획해보세요!';
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => {
      sessionStorage.setItem('splashShown', '1');
      setShowSplash(false);
    }} />;
  }

  const hasNoTrips = summaries.length === 0;

  return (
    <div>
      <Header title="My Journey" />

      {/* 시간대별 인사말 */}
      <section className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-2">
        <p className="text-lg font-medium text-text-primary">{getGreeting()}</p>
        <p className="text-sm text-text-secondary">{getSubtitle()}</p>
      </section>

      {/* 디자인 비교 토글 (임시) */}
      <section className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-2 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-tertiary">디자인:</span>
          {(['A', 'B', 'C'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={cn(
                'px-3 py-1 text-xs rounded-full border transition-colors',
                variant === v
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-secondary border-border-light hover:border-primary/50'
              )}
            >
              {v}안
            </button>
          ))}
        </div>
      </section>

      {/* 여행 없을 때 빈 상태 */}
      {hasNoTrips && (
        <EmptyState
          icon="✈️"
          title="아직 여행이 없어요"
          description="AI와 대화하며 첫 여행을 계획해보세요"
          action={<NewTripButton />}
        />
      )}

      {/* 히어로 카드 (ongoing 또는 upcoming 첫번째) */}
      {heroTrip && (
        <section className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-4 pb-2">
          <TripHeroCard trip={heroTrip} packingProgress={heroPackingProgress} variant={variant} />
        </section>
      )}

      {/* 다가오는 여행 섹션 (ongoing 나머지 + upcoming 나머지) */}
      {(remainingOngoing.length + remainingUpcoming.length) > 0 && (
        <section className="pt-6 pb-2">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-text-primary">다가오는 여행</h2>
              <span className="text-sm text-text-tertiary">
                {remainingOngoing.length + remainingUpcoming.length}
              </span>
            </div>
            <NewTripButton />
          </div>
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col gap-3">
            {[...remainingOngoing, ...remainingUpcoming].map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} variant={variant} />
            ))}
          </div>
        </section>
      )}

      {/* 지난 여행 섹션 */}
      {past.length > 0 && (
        <section className="pt-6 pb-2">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-text-primary">지난 여행</h2>
              <span className="text-sm text-text-tertiary">{past.length}</span>
            </div>
            {/* 다가오는 여행이 없을 때만 여기에 새 여행 버튼 표시 */}
            {remainingOngoing.length + remainingUpcoming.length === 0 && !hasNoTrips && (
              <NewTripButton />
            )}
          </div>
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col gap-3">
            {past.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} variant={variant} />
            ))}
          </div>
        </section>
      )}

      {/* 빌드 버전 */}
      <footer className="max-w-[1100px] mx-auto px-5 pb-4 pt-8 text-center">
        <p className="text-[10px] text-text-tertiary">
          Build {process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7)} · {process.env.NEXT_PUBLIC_BUILD_TIME?.slice(0, 16).replace('T', ' ')}
        </p>
      </footer>
    </div>
  );
}
