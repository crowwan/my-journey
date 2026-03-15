'use client';

import { useEffect, useState } from 'react';
import { useTripStore } from '@/stores/useTripStore';
import { useUIStore } from '@/stores/useUIStore';
import { groupTrips } from '@/lib/trip-utils';
import { Header } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TripCard } from '@/components/home/TripCard';
import { TripHeroCard } from '@/components/home/TripHeroCard';
import { NewTripButton } from '@/components/home/NewTripButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Sun, CloudSun, Moon, MoonStar, Plane, Plus } from 'lucide-react';

// 시간대별 인사말 텍스트와 아이콘을 반환
function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  const iconClass = 'inline-block ml-1.5 text-primary align-middle -mt-0.5';
  if (hour >= 5 && hour <= 11) return { text: '좋은 아침이에요', icon: <Sun size={18} className={iconClass} /> };
  if (hour >= 12 && hour <= 17) return { text: '좋은 오후예요', icon: <CloudSun size={18} className={iconClass} /> };
  if (hour >= 18 && hour <= 22) return { text: '좋은 저녁이에요', icon: <Moon size={18} className={iconClass} /> };
  return { text: '늦은 밤이에요', icon: <MoonStar size={18} className={iconClass} /> };
}

export default function Home() {
  const { isLoaded, loadTrips, getTripSummaries, deleteTrip } = useTripStore();
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);
  const trips = useTripStore((s) => s.trips);
  // 세션 내 첫 방문 여부를 초기값에서 판단 (불필요한 useEffect 제거)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('splashShown');
    }
    return true;
  });

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  const summaries = getTripSummaries();
  const { upcoming, ongoing, past } = groupTrips(summaries);

  // 최근 생성한 여행 (createdAt 기준 가장 최근 1개, 미래 여행만 히어로로 표시)
  const latestTripRaw = summaries.length > 0
    ? summaries.reduce((latest, current) => {
        const latestFull = trips.get(latest.id);
        const currentFull = trips.get(current.id);
        if (!latestFull || !currentFull) return latest;
        return currentFull.createdAt > latestFull.createdAt ? current : latest;
      })
    : null;

  // 최근 생성이 과거 여행이면 히어로로 표시하지 않음
  const isLatestPast = latestTripRaw
    ? past.some((t) => t.id === latestTripRaw.id)
    : false;
  const latestTrip = isLatestPast ? null : latestTripRaw;

  // 최근 생성 카드를 다른 섹션에서 제외 (히어로로 표시될 때만)
  const upcomingFiltered = latestTrip ? upcoming.filter((t) => t.id !== latestTrip.id) : upcoming;
  const ongoingFiltered = latestTrip ? ongoing.filter((t) => t.id !== latestTrip.id) : ongoing;
  const pastFiltered = past;

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
  const greeting = getGreeting();

  return (
    <div>
      <Header title="My Journey" />

      {/* 시간대별 인사말 */}
      <section className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-6 pb-2">
        <p className="text-lg font-medium text-text-primary flex items-center">
          {greeting.text}
          {greeting.icon}
        </p>
        <p className="text-sm text-text-secondary">{getSubtitle()}</p>
      </section>


      {/* 여행 없을 때 빈 상태 */}
      {hasNoTrips && (
        <EmptyState
          icon={<Plane size={48} className="text-primary" />}
          title="아직 여행이 없어요"
          description="AI와 대화하며 첫 여행을 계획해보세요"
          action={
            <button
              onClick={() => openAIDrawer('create')}
              className="flex items-center gap-2 rounded-full bg-primary text-white px-6 py-3 text-sm font-medium hover:bg-primary-600 shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              새 여행 만들기
            </button>
          }
        />
      )}

      {/* 최근 생성 섹션 */}
      {latestTrip && (
        <section className="pt-6 pb-2">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-text-primary">최근 생성</h2>
            <NewTripButton />
          </div>
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8">
            <TripHeroCard trip={latestTrip} onDelete={deleteTrip} />
          </div>
        </section>
      )}

      {/* 다가오는 여행 섹션 (히어로 + 나머지) */}
      {(ongoingFiltered.length + upcomingFiltered.length) > 0 && (
        <section className="pt-6 pb-2">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-text-primary">다가오는 여행</h2>
              <span className="text-sm text-text-tertiary">
                {ongoingFiltered.length + upcomingFiltered.length}
              </span>
            </div>
          </div>
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col gap-3">
            {[...ongoingFiltered, ...upcomingFiltered].map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} onDelete={deleteTrip} />
            ))}
          </div>
        </section>
      )}

      {/* 지난 여행 섹션 */}
      {pastFiltered.length > 0 && (
        <section className="pt-6 pb-2">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-text-primary">지난 여행</h2>
              <span className="text-sm text-text-tertiary">{pastFiltered.length}</span>
            </div>
          </div>
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col gap-3">
            {pastFiltered.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} onDelete={deleteTrip} />
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
