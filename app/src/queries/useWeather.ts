// ============================================================
// 날씨 데이터 React Query 훅
// 기존 lib/useWeather.ts의 useState+useEffect 패턴을 대체
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/api/weather';

// 쿼리 키 팩토리
export const weatherKeys = {
  all: ['weather'] as const,
  detail: (destination: string, startDate: string, endDate: string) =>
    [...weatherKeys.all, destination, startDate, endDate] as const,
};

interface FallbackCoords {
  lat: number;
  lng: number;
}

/**
 * 실시간 날씨 데이터를 조회하는 React Query 훅
 * 기존 useWeather와 동일한 인터페이스 반환 (data, loading, error, lastUpdated)
 */
export function useWeather(
  destination: string,
  startDate: string,
  endDate: string,
  fallbackCoords?: FallbackCoords,
) {
  const query = useQuery({
    queryKey: weatherKeys.detail(destination, startDate, endDate),
    queryFn: () => fetchWeather({ destination, startDate, endDate, fallbackCoords }),
    staleTime: 1000 * 60 * 60, // 1시간 (서버 캐시 TTL과 동일)
    enabled: !!destination && !!startDate && !!endDate,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : '날씨 데이터를 가져올 수 없습니다.') : null,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
}
