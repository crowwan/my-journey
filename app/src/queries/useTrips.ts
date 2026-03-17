// ============================================================
// Trip CRUD React Query 훅
// localStorage(storage.ts)를 queryFn으로 사용하며,
// Supabase 전환 시 queryFn만 교체하면 된다.
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import type { Trip, TripSummary } from '@/types/trip';

// 쿼리 키 팩토리 (일관된 캐시 키 관리)
export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  detail: (id: string) => [...tripKeys.all, 'detail', id] as const,
};

// 전체 여행 목록 조회 (TripSummary[])
export function useTrips() {
  return useQuery({
    queryKey: tripKeys.lists(),
    queryFn: () => storage.getTripSummaries(),
    staleTime: Infinity, // localStorage는 외부에서 변경되지 않음
  });
}

// 전체 여행 목록 (Trip[] - 캘린더 등 전체 데이터 필요 시)
export function useAllTrips() {
  return useQuery({
    queryKey: tripKeys.all,
    queryFn: () => storage.getAllTrips(),
    staleTime: Infinity,
  });
}

// 단일 여행 조회
export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(tripId!),
    queryFn: () => storage.getTrip(tripId!),
    enabled: !!tripId,
    staleTime: Infinity,
  });
}

// 여행 저장 mutation
export function useSaveTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trip: Trip) => {
      storage.saveTrip(trip);
      return Promise.resolve(trip);
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
  return useMutation({
    mutationFn: (tripId: string) => {
      storage.deleteTrip(tripId);
      return Promise.resolve(tripId);
    },
    onSuccess: (tripId) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
      queryClient.removeQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}
