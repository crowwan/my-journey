'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTrips, useAllTrips, useDeleteTrip } from '@/queries/useTrips';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/useUIStore';
import { groupTrips } from '@/domain/trip';
import { Header } from '@/components/layout/Header';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { TripCard } from '@/components/home/TripCard';
import { TripHeroCard } from '@/components/home/TripHeroCard';
import { NewTripButton } from '@/components/home/NewTripButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Sun, CloudSun, Moon, MoonStar, Plane, Plus, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useSignInWithKakao } from '@/hooks/useAuth';

// 시간대별 인사말 텍스트와 아이콘을 반환
function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  const iconClass = 'inline-block ml-1.5 text-primary align-middle -mt-0.5';
  if (hour >= 5 && hour <= 11) return { text: '좋은 아침이에요', icon: <Sun size={18} className={iconClass} /> };
  if (hour >= 12 && hour <= 17) return { text: '좋은 오후예요', icon: <CloudSun size={18} className={iconClass} /> };
  if (hour >= 18 && hour <= 22) return { text: '좋은 저녁이에요', icon: <Moon size={18} className={iconClass} /> };
  return { text: '늦은 밤이에요', icon: <MoonStar size={18} className={iconClass} /> };
}

// 비로그인 사용자용 랜딩 화면
function LandingSection() {
  const signInWithKakao = useSignInWithKakao();

  const features = [
    { icon: <MapPin className="size-5 text-primary-500" />, title: '맞춤 일정', desc: '목적지와 기간만 알려주세요' },
    { icon: <Calendar className="size-5 text-secondary-500" />, title: '상세 계획', desc: '시간대별 일정을 자동 생성' },
    { icon: <Sparkles className="size-5 text-cat-shopping" />, title: 'AI 수정', desc: '대화로 일정을 자유롭게 수정' },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      <Header title="My Journey" />

      {/* 히어로 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8">
        <div className="max-w-md w-full text-center space-y-8">
          {/* 아이콘 + 타이틀 */}
          <div className="space-y-4 animate-fade-up">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary-50">
              <Plane className="size-10 text-primary-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
              AI와 함께<br />여행을 계획하세요
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              목적지, 기간만 알려주면<br />
              AI가 맞춤 일정을 만들어드려요
            </p>
          </div>

          {/* 기능 소개 카드 */}
          <div className="flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-3 bg-surface rounded-xl border border-border-light p-4 text-left"
              >
                <div className="flex-shrink-0 size-10 rounded-lg bg-bg-secondary flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{f.title}</p>
                  <p className="text-xs text-text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 카카오 로그인 버튼 */}
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => signInWithKakao.mutate()}
              disabled={signInWithKakao.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-[#391B1B] font-semibold text-sm py-3.5 hover:brightness-95 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {/* 카카오 로고 SVG */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 0.6C4.03 0.6 0 3.713 0 7.534c0 2.447 1.626 4.6 4.076 5.82-.18.67-.65 2.428-.744 2.805-.116.467.171.46.36.335.148-.098 2.36-1.6 3.316-2.252.322.047.652.072.992.072 4.97 0 9-3.113 9-6.78C18 3.713 13.97.6 9 .6Z"
                  fill="#391B1B"
                />
              </svg>
              카카오로 시작하기
            </button>
          </div>
        </div>
      </main>

      {/* 빌드 버전 */}
      <footer className="px-5 pb-4 pt-8 text-center">
        <p className="text-[10px] text-text-tertiary">
          Build {process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7)} · {process.env.NEXT_PUBLIC_BUILD_TIME?.slice(0, 16).replace('T', ' ')}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  const { data: user, isLoading: isAuthLoading } = useAuth();
  const { data: summaries = [] } = useTrips();
  const { data: allTrips = [] } = useAllTrips();
  const deleteTripMutation = useDeleteTrip();
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);
  const [showSplash, setShowSplash] = useState(true);

  // 서버/클라이언트 일치를 위해 useEffect에서 sessionStorage 확인 (hydration 안전)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setShowSplash(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const { upcoming, ongoing, past } = groupTrips(summaries);

  // Trip ID로 전체 데이터를 빠르게 조회하기 위한 Map
  const tripsMap = useMemo(
    () => new Map(allTrips.map((t) => [t.id, t])),
    [allTrips],
  );

  // 최근 생성한 여행 (createdAt 기준 가장 최근 1개, 미래 여행만 히어로로 표시)
  const latestTripRaw = summaries.length > 0
    ? summaries.reduce((latest, current) => {
        const latestFull = tripsMap.get(latest.id);
        const currentFull = tripsMap.get(current.id);
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

  // 비로그인 사용자에게 랜딩 화면 표시
  // isAuthLoading 중에는 판단 보류 (빈 화면)
  if (isAuthLoading) {
    return (
      <div>
        <Header title="My Journey" showCalendar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="size-8 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingSection />;
  }

  return (
    <div>
      <Header title="My Journey" showCalendar />

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
            <TripHeroCard trip={latestTrip} onDelete={(id: string) => deleteTripMutation.mutate(id)} />
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
              <TripCard key={trip.id} trip={trip} index={index} onDelete={(id: string) => deleteTripMutation.mutate(id)} />
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
              <TripCard key={trip.id} trip={trip} index={index} onDelete={(id: string) => deleteTripMutation.mutate(id)} />
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
