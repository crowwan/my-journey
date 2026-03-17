// ============================================================
// Trip Store (클라이언트 상태만 관리)
// 서버 상태(Trip CRUD)는 queries/useTrips.ts (React Query)로 이관됨
// ============================================================
import { create } from 'zustand';
import { storage } from '@/lib/storage';

interface TripState {
  currentTripId: string | null;

  // Actions
  setCurrentTrip: (tripId: string | null) => void;

  // 준비물 체크 (로컬 상태 - 별도 localStorage 키 사용)
  togglePackingItem: (tripId: string, category: string, itemName: string) => void;
  // 체크 상태 변경 시 리렌더링 트리거를 위한 카운터
  packingVersion: number;
}

export const useTripStore = create<TripState>((set) => ({
  currentTripId: null,
  packingVersion: 0,

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  togglePackingItem: (tripId, category, itemName) => {
    const checked = storage.getPackingChecked(tripId);
    const categoryItems = checked[category] || [];
    if (categoryItems.includes(itemName)) {
      checked[category] = categoryItems.filter((name) => name !== itemName);
    } else {
      checked[category] = [...categoryItems, itemName];
    }
    storage.setPackingChecked(tripId, checked);
    // 리렌더링 트리거 (카운터 증가)
    set((state) => ({ packingVersion: state.packingVersion + 1 }));
  },
}));
