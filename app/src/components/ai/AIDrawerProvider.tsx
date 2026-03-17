'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { useAuth } from '@/hooks/useAuth';
import { AIFloatingButton } from './AIFloatingButton';
import { AIDrawer } from './AIDrawer';
import { AISplitView } from './AISplitView';

// 데스크탑 미디어 쿼리 (sm breakpoint = 640px)
const desktopQuery = '(min-width: 640px)';

function subscribeToDesktop(callback: () => void) {
  const mql = window.matchMedia(desktopQuery);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}

// SSR에서는 항상 false (모바일 기본값)
function getServerSnapshot() {
  return false;
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, getServerSnapshot);
}

// 레이아웃 레벨에서 FAB + 드로어/Split View를 제공하는 클라이언트 컴포넌트
export function AIDrawerProvider() {
  const { data: user } = useAuth();
  const isOpen = useUIStore((s) => s.isAIDrawerOpen);
  const mode = useUIStore((s) => s.aiDrawerMode);
  const tripId = useUIStore((s) => s.aiDrawerTripId);
  const aiViewMode = useUIStore((s) => s.aiViewMode);
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);
  const closeAIDrawer = useUIStore((s) => s.closeAIDrawer);
  const setAIViewMode = useUIStore((s) => s.setAIViewMode);

  const generatedTrip = useChatStore((s) => s.generatedTrip);
  const isDesktop = useIsDesktop();

  // 초안 생성 완료 시 데스크탑에서 자동 Split View 전환
  useEffect(() => {
    if (generatedTrip && isDesktop && isOpen && aiViewMode === 'drawer') {
      setAIViewMode('split');
    }
  }, [generatedTrip, isDesktop, isOpen, aiViewMode, setAIViewMode]);

  // FAB 토글 — 열려있으면 닫기, 닫혀있으면 열기
  // 닫을 때 대화는 유지 (세션 영속화)
  const handleToggle = () => {
    if (isOpen) {
      closeAIDrawer();
    } else {
      openAIDrawer();
    }
  };

  // Split View 모드 + 데스크탑 + 열린 상태 → AISplitView 렌더링
  const showSplitView = isOpen && aiViewMode === 'split' && isDesktop;

  // 비로그인 시 AI 기능 숨김
  if (!user) return null;

  return (
    <>
      {/* Split View 모드가 아닐 때만 FAB 표시 */}
      {!showSplitView && (
        <AIFloatingButton isOpen={isOpen} onClick={handleToggle} />
      )}

      {showSplitView ? (
        <AISplitView mode={mode} tripId={tripId} />
      ) : (
        <AIDrawer isOpen={isOpen} onClose={closeAIDrawer} mode={mode} tripId={tripId} />
      )}
    </>
  );
}
