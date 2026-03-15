// ============================================================
// UI Store
// AI 드로어 열림/닫힘 + Split View 상태 관리
// ============================================================
import { create } from 'zustand';

interface UIState {
  isAIDrawerOpen: boolean;
  aiDrawerMode: 'create' | 'edit';
  aiDrawerTripId?: string;
  // Split View 모드: 데스크탑에서 좌측 TripViewer + 우측 채팅
  aiViewMode: 'drawer' | 'split';

  openAIDrawer: (mode?: 'create' | 'edit', tripId?: string) => void;
  closeAIDrawer: () => void;
  setAIViewMode: (mode: 'drawer' | 'split') => void;
  // Split View를 열면서 edit 모드 진입 (기존 여행 수정용)
  openAISplitView: (mode: 'create' | 'edit', tripId?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIDrawerOpen: false,
  aiDrawerMode: 'create',
  aiDrawerTripId: undefined,
  aiViewMode: 'drawer',

  openAIDrawer: (mode = 'create', tripId) =>
    set({ isAIDrawerOpen: true, aiDrawerMode: mode, aiDrawerTripId: tripId }),
  closeAIDrawer: () => set({ isAIDrawerOpen: false, aiViewMode: 'drawer' }),
  setAIViewMode: (mode) => set({ aiViewMode: mode }),
  openAISplitView: (mode, tripId) =>
    set({
      isAIDrawerOpen: true,
      aiDrawerMode: mode,
      aiDrawerTripId: tripId,
      aiViewMode: 'split',
    }),
}));
