// ============================================================
// Trip Store (클라이언트 상태만 관리)
// 서버 상태(Trip CRUD)는 queries/useTrips.ts (React Query)로 이관됨
// ============================================================
import { create } from 'zustand';
import { storage } from '@/lib/storage';
import * as tripApi from '@/lib/supabase/trip-api';

interface TripState {
  currentTripId: string | null;

  // Actions
  setCurrentTrip: (tripId: string | null) => void;

  // 준비물 체크 (로그인 시 Supabase, 비로그인 시 localStorage)
  togglePackingItem: (
    tripId: string,
    category: string,
    itemName: string,
    userId?: string, // 로그인 시 user.id 전달
  ) => void;
  // 체크 상태 변경 시 리렌더링 트리거를 위한 카운터
  packingVersion: number;
}

export const useTripStore = create<TripState>((set) => ({
  currentTripId: null,
  packingVersion: 0,

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  togglePackingItem: (tripId, category, itemName, userId) => {
    // 기존 체크 상태를 localStorage에서 읽기 (동기)
    const checked = storage.getPackingChecked(tripId);
    const categoryItems = checked[category] || [];
    const newItems = categoryItems.includes(itemName)
      ? categoryItems.filter((name) => name !== itemName)
      : [...categoryItems, itemName];
    checked[category] = newItems;

    // localStorage에 항상 저장 (로컬 캐시 역할)
    storage.setPackingChecked(tripId, checked);

    // 로그인 상태면 Supabase에도 저장 (비동기, 에러 시 조용히 실패)
    if (userId) {
      tripApi
        .setPackingCheck(tripId, userId, category, newItems)
        .catch(() => {
          // Supabase 저장 실패 시 localStorage에는 이미 반영됨
          // TODO: 에러 알림 추가 고려
        });
    }

    // 리렌더링 트리거 (카운터 증가)
    set((state) => ({ packingVersion: state.packingVersion + 1 }));
  },
}));
