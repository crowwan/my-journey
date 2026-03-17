// ============================================================
// 환율 데이터 React Query 훅
// 기존 lib/useCurrency.ts의 useState+useEffect 패턴을 대체
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { fetchCurrencyRate } from '@/api/currency';

// 쿼리 키 팩토리
export const currencyKeys = {
  all: ['currency'] as const,
  rate: (from: string, to: string) =>
    [...currencyKeys.all, from, to] as const,
};

/**
 * 환율 데이터를 조회하는 React Query 훅
 * 기존 useCurrency와 동일한 인터페이스 반환 (rate, loading, error, lastUpdated)
 */
export function useCurrency(from: string, to: string) {
  const query = useQuery({
    queryKey: currencyKeys.rate(from, to),
    queryFn: () => fetchCurrencyRate(from, to),
    staleTime: 1000 * 60 * 30, // 30분
    enabled: !!from && !!to,
  });

  return {
    rate: query.data?.rate ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error instanceof Error ? query.error.message : '환율 정보를 불러올 수 없습니다.') : null,
    lastUpdated: query.data?.lastUpdated ? new Date(query.data.lastUpdated) : null,
  };
}
