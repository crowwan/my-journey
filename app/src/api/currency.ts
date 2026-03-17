// ============================================================
// 환율 API fetch 함수
// /api/currency Route Handler를 호출하는 클라이언트 코드
// ============================================================

// API 응답 DTO (이 파일 안에서만 사용)
interface CurrencyApiResponse {
  success: boolean;
  data?: {
    rate: number;
    from: string;
    to: string;
    lastUpdated: string;
  };
  error?: string;
}

// 외부에 노출하는 반환 타입
export interface CurrencyRateResult {
  rate: number;
  lastUpdated: string;
}

/**
 * 환율 데이터를 조회하는 API fetch 함수
 * 동일 통화이면 즉시 { rate: 1 } 반환
 * @returns CurrencyRateResult 또는 에러 throw
 */
export async function fetchCurrencyRate(
  from: string,
  to: string,
): Promise<CurrencyRateResult> {
  // 동일 통화면 즉시 반환
  if (from === to) {
    return { rate: 1, lastUpdated: new Date().toISOString() };
  }

  const params = new URLSearchParams({ from, to });
  const response = await fetch(`/api/currency?${params.toString()}`);
  const result: CurrencyApiResponse = await response.json();

  if (result.success && result.data) {
    return {
      rate: result.data.rate,
      lastUpdated: result.data.lastUpdated,
    };
  }

  throw new Error(result.error ?? '환율 정보를 불러올 수 없습니다.');
}
