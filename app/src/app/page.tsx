'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/stores/useTripStore';
import { storage } from '@/lib/storage';
import { getPackingProgress, getTripStatus } from '@/lib/trip-utils';
import { Header } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TripCard } from '@/components/home/TripCard';
import type { TripSummary } from '@/types/trip';

function getGreeting(): { text: string; emoji: string; sub: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour <= 11) return { text: '좋은 아침이에요', emoji: '☀️', sub: '오늘의 여행 계획을 확인해보세요' };
  if (hour >= 12 && hour <= 17) return { text: '좋은 오후예요', emoji: '🌤️', sub: '어디로 떠나볼까요?' };
  if (hour >= 18 && hour <= 22) return { text: '좋은 저녁이에요', emoji: '🌙', sub: '다음 여행을 준비해보세요' };
  return { text: '늦은 밤이에요', emoji: '🌛', sub: '내일의 여행을 계획해볼까요?' };
}

// 퀵 액션 아이콘 데이터
const QUICK_ACTIONS = [
  { icon: '✈️', label: '새 여행', path: '/chat' },
  { icon: '🗺️', label: 'AI 추천', path: '/chat?prompt=추천' },
  { icon: '🧳', label: '체크리스트', path: '' },
];

export default function Home() {
  const router = useRouter();
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
  const greeting = getGreeting();

  // 여행을 상태별로 분류
  const upcomingTrips: TripSummary[] = [];
  const ongoingTrips: TripSummary[] = [];
  const completedTrips: TripSummary[] = [];

  summaries.forEach((s) => {
    const status = getTripStatus(s.startDate, s.endDate);
    if (status === 'ongoing') ongoingTrips.push(s);
    else if (status === 'upcoming') upcomingTrips.push(s);
    else completedTrips.push(s);
  });

  if (showSplash) {
    return <SplashScreen onFinish={() => {
      sessionStorage.setItem('splashShown', '1');
      setShowSplash(false);
    }} />;
  }

  const renderTripSection = (title: string, icon: string, trips: TripSummary[], startIndex: number) => {
    if (trips.length === 0) return null;
    return (
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{icon}</span>
          <h3 className="text-[15px] font-bold text-text">{title}</h3>
          <span className="text-xs text-text-tertiary font-medium">{trips.length}</span>
        </div>
        <div className="flex flex-col gap-3">
          {trips.map((summary, index) => {
            const fullTrip = useTripStore.getState().trips.get(summary.id);
            const checkedMap = storage.getPackingChecked(summary.id);
            const packingProgress = getPackingProgress(fullTrip?.packing, checkedMap);
            return (
              <TripCard
                key={summary.id}
                trip={summary}
                index={startIndex + index}
                packingProgress={packingProgress}
              />
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-bg">
      <Header title="My Journey" />

      {/* 히어로 배너 */}
      <section className="gradient-hero px-5 pt-4 pb-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl animate-float">{greeting.emoji}</div>
            <div>
              <p className="text-xl font-black text-text">{greeting.text}</p>
              <p className="text-sm text-text-secondary">{greeting.sub}</p>
            </div>
          </div>

          {/* 검색 바 (클릭 시 채팅으로 이동) */}
          <button
            onClick={() => router.push('/chat')}
            className="w-full flex items-center gap-3 bg-surface-elevated rounded-2xl px-4 py-3.5 shadow-[var(--shadow-card)] border border-border hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 text-left group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-sm text-text-tertiary group-hover:text-text-secondary transition-colors">어디로 떠나볼까요?</span>
          </button>

          {/* 퀵 액션 그리드 */}
          <div className="flex gap-4 mt-4 justify-center">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => action.path && router.push(action.path)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-elevated shadow-[var(--shadow-sm)] border border-border flex items-center justify-center text-xl group-hover:shadow-[var(--shadow-card)] group-hover:-translate-y-0.5 transition-all duration-200">
                  {action.icon}
                </div>
                <span className="text-[11px] font-medium text-text-secondary">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 여행 리스트 */}
      <main className="max-w-[1100px] mx-auto px-5 py-6">
        {summaries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌍</div>
            <p className="text-lg font-bold text-text mb-1">아직 여행이 없어요</p>
            <p className="text-sm text-text-secondary mb-6">AI와 함께 첫 번째 여행을 계획해보세요</p>
            <button
              onClick={() => router.push('/chat')}
              className="inline-flex items-center gap-2 gradient-accent text-white rounded-xl px-6 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
            >
              <span>✈️</span>
              여행 만들기
            </button>
          </div>
        ) : (
          <>
            {renderTripSection('여행 중', '🛫', ongoingTrips, 0)}
            {renderTripSection('다가오는 여행', '📅', upcomingTrips, ongoingTrips.length)}
            {renderTripSection('지난 여행', '📸', completedTrips, ongoingTrips.length + upcomingTrips.length)}
          </>
        )}
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
