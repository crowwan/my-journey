// ============================================================
// Trip CRUD React Query 훅
// 인증 상태에 따라 queryFn 분기:
//   로그인 → Supabase (tripApi)
//   비로그인 → localStorage (storage) — Guest Mode
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import * as tripApi from '@/lib/supabase/trip-api';
import { useAuth } from '@/hooks/useAuth';
import type { Trip, TripSummary } from '@/types/trip';

// 쿼리 키 팩토리 (일관된 캐시 키 관리)
export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  detail: (id: string) => [...tripKeys.all, 'detail', id] as const,
};

// Supabase 쿼리용 설정 (서버 데이터는 외부 변경 가능)
const SUPABASE_STALE_TIME = 1000 * 60 * 2; // 2분
// localStorage 쿼리용 설정 (외부 변경 없음)
const LOCAL_STALE_TIME = Infinity;

// 전체 여행 목록 조회 (TripSummary[])
export function useTrips() {
  const { data: user } = useAuth();
  const isLoggedIn = !!user;

  return useQuery({
    queryKey: tripKeys.lists(),
    queryFn: (): Promise<TripSummary[]> =>
      isLoggedIn
        ? tripApi.getTripSummaries()
        : Promise.resolve(storage.getTripSummaries()),
    staleTime: isLoggedIn ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: isLoggedIn ? 2 : false,
  });
}

// 전체 여행 목록 (Trip[] - 캘린더 등 전체 데이터 필요 시)
export function useAllTrips() {
  const { data: user } = useAuth();
  const isLoggedIn = !!user;

  return useQuery({
    queryKey: tripKeys.all,
    queryFn: (): Promise<Trip[]> =>
      isLoggedIn
        ? tripApi.getAllTrips()
        : Promise.resolve(storage.getAllTrips()),
    staleTime: isLoggedIn ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: isLoggedIn ? 2 : false,
  });
}

// 단일 여행 조회
export function useTrip(tripId: string | undefined) {
  const { data: user } = useAuth();
  const isLoggedIn = !!user;

  return useQuery({
    queryKey: tripKeys.detail(tripId!),
    queryFn: (): Promise<Trip | null> =>
      isLoggedIn
        ? tripApi.getTrip(tripId!)
        : Promise.resolve(storage.getTrip(tripId!)),
    enabled: !!tripId,
    staleTime: isLoggedIn ? SUPABASE_STALE_TIME : LOCAL_STALE_TIME,
    retry: isLoggedIn ? 2 : false,
  });
}

// 여행 저장 mutation
export function useSaveTrip() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  return useMutation({
    mutationFn: async (trip: Trip) => {
      if (user) {
        // 로그인 → Supabase 저장
        await tripApi.saveTrip(trip, user.id);
      } else {
        // 비로그인 → localStorage 저장
        storage.saveTrip(trip);
      }
      return trip;
    },
    onSuccess: (trip) => {
      // 목록과 전체 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      // 단일 여행 캐시 즉시 업데이트
      queryClient.setQueryData(tripKeys.detail(trip.id), trip);
    },
  });
}

// 여행 삭제 mutation
export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  return useMutation({
    mutationFn: async (tripId: string) => {
      if (user) {
        await tripApi.deleteTrip(tripId);
      } else {
        storage.deleteTrip(tripId);
      }
      return tripId;
    },
    onSuccess: (tripId) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.removeQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
