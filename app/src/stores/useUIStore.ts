// ============================================================
// UI Store
// AI 드로어 열림/닫힘 상태 관리
// ============================================================
import { create } from 'zustand';

interface UIState {
  isAIDrawerOpen: boolean;
  aiDrawerMode: 'create' | 'edit';
  aiDrawerTripId?: string;
  openAIDrawer: (mode?: 'create' | 'edit', tripId?: string) => void;
  closeAIDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAIDrawerOpen: false,
  aiDrawerMode: 'create',
  aiDrawerTripId: undefined,
  openAIDrawer: (mode = 'create', tripId) =>
    set({ isAIDrawerOpen: true, aiDrawerMode: mode, aiDrawerTripId: tripId }),
  closeAIDrawer: () => set({ isAIDrawerOpen: false }),
}));
