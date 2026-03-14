'use client';

import { useUIStore } from '@/stores/useUIStore';
import { useChatStore } from '@/stores/useChatStore';
import { AIFloatingButton } from './AIFloatingButton';
import { AIDrawer } from './AIDrawer';

// 레이아웃 레벨에서 FAB + 드로어를 제공하는 클라이언트 컴포넌트
export function AIDrawerProvider() {
  const isOpen = useUIStore((s) => s.isAIDrawerOpen);
  const mode = useUIStore((s) => s.aiDrawerMode);
  const tripId = useUIStore((s) => s.aiDrawerTripId);
  const openAIDrawer = useUIStore((s) => s.openAIDrawer);
  const closeAIDrawer = useUIStore((s) => s.closeAIDrawer);
  const clearMessages = useChatStore((s) => s.clearMessages);

  // FAB 토글 — 열려있으면 닫기, 닫혀있으면 열기
  const handleToggle = () => {
    if (isOpen) {
      closeAIDrawer();
      clearMessages();
    } else {
      openAIDrawer();
    }
  };

  return (
    <>
      <AIFloatingButton isOpen={isOpen} onClick={handleToggle} />
      <AIDrawer isOpen={isOpen} onClose={closeAIDrawer} mode={mode} tripId={tripId} />
    </>
  );
}
