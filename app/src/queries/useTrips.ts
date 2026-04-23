// ============================================================
// Trip CRUD React Query 훅
// 인증 상태에 따라 queryFn 분기:
//   로그인 → Supabase (tripApi)
//   비로그인 → localStorage (storage) — Guest Mode
//   캡처용 모킹(MOCK_OAUTH)     → localStorage 강제 사용
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import * as tripApi from '@/lib/supabase/trip-api';
import { useAuth } from '@/hooks/useAuth';
import { isMockOAuthEnabled } from '@/lib/capture-flags';
import type { Trip, TripSummary } from '@/types/trip';

// 쿼리 키 팩토리 (userId로 캐시 분리 — 로그인/비로그인 캐시 혼재 방지)
export const tripKeys = {
  all: (userId?: string) => ['trips', userId ?? 'anonymous'] as const,
  lists: (userId?: string) => [...tripKeys.all(userId), 'list'] as const,
  details: (userId?: string) => [...tripKeys.all(userId), 'detail'] as const,
  detail: (userId: string | undefined, id: string) =>
    [...tripKeys.details(userId), id] as const,
};

// Supabase 쿼리용 설정 (서버 데이터는 외부 변경 가능)
const SUPABASE_STALE_TIME = 1000 * 60 * 2; // 2분
// localStorage 쿼리용 설정 (외부 변경 없음)
const LOCAL_STALE_TIME = Infinity;

// 전체 여행 목록 조회 (TripSummary[])
export function useTrips() {
  const { data: user } = useAuth();
  // 모킹 모드: Supabase 네트워크를 타지 않도록 localStorage 경로 사용
  const useRemote = !!user && !isMockOAuthEnabled();
  const userId = user?.id;

  return useQuery({
    queryKey: tripKeys.lists(userId),
    queryFn: (): Promise<TripSummary[]> =>
      useRemote
        ? tripApi.getTripSummaries()
        : Promise.resolve(storage.getTripSummaries()),
    staleTime: useRemote ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: useRemote ? 2 : false,
  });
}

// 전체 여행 목록 (Trip[] - 캘린더 등 전체 데이터 필요 시)
export function useAllTrips() {
  const { data: user } = useAuth();
  const useRemote = !!user && !isMockOAuthEnabled();
  const userId = user?.id;

  return useQuery({
    queryKey: tripKeys.all(userId),
    queryFn: (): Promise<Trip[]> =>
      useRemote
        ? tripApi.getAllTrips()
        : Promise.resolve(storage.getAllTrips()),
    staleTime: useRemote ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: useRemote ? 2 : false,
  });
}

// 단일 여행 조회
export function useTrip(tripId: string | undefined) {
  const { data: user } = useAuth();
  const useRemote = !!user && !isMockOAuthEnabled();
  const userId = user?.id;

  return useQuery({
    queryKey: tripKeys.detail(userId, tripId!),
    queryFn: (): Promise<Trip | null> =>
      useRemote
        ? tripApi.getTrip(tripId!)
        : Promise.resolve(storage.getTrip(tripId!)),
    enabled: !!tripId,
    staleTime: useRemote ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: useRemote ? 2 : false,
  });
}

// 여행 저장 mutation
export function useSaveTrip() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const useRemote = !!user && !isMockOAuthEnabled();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (trip: Trip) => {
      if (useRemote && user) {
        // 로그인 & 실 Supabase → 원격 저장
        await tripApi.saveTrip(trip, user.id);
      } else {
        // 비로그인 또는 모킹 → localStorage 저장
        storage.saveTrip(trip);
      }
      return trip;
    },
    onSuccess: (trip) => {
      // 목록과 전체 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: tripKeys.lists(userId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.all(userId) });
      // 단일 여행 캐시 즉시 업데이트
      queryClient.setQueryData(tripKeys.detail(userId, trip.id), trip);
    },
  });
}

// 여행 삭제 mutation
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();
  const useRemote = !!user && !isMockOAuthEnabled();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (tripId: string) => {
      if (useRemote) {
        await tripApi.deleteTrip(tripId);
      } else {
        storage.deleteTrip(tripId);
      }
      return tripId;
    },
    onSuccess: (tripId) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists(userId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.all(userId) });
      queryClient.removeQueries({ queryKey: tripKeys.detail(userId, tripId) });
    },
  });
}
