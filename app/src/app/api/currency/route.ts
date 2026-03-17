// ============================================================
// 환율 API Route — ExchangeRate-API v6
// GET /api/currency?from=KRW&to=JPY
// 환경변수: EXCHANGE_RATE_API_KEY
// ============================================================

import { NextResponse } from 'next/server';
import { createCache } from '@/lib/api-cache';

// 환율 응답 타입
interface CurrencyResponse {
  rate: number;
  from: string;
  to: string;
  lastUpdated: string;
}

// ExchangeRate-API 응답 타입
interface ExchangeRateApiResponse {
  result: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
}

// 6시간 캐시
const currencyCache = createCache<CurrencyResponse>(6 * 60 * 60 * 1000);

export async function GET(req: Request) {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    // API 키 미설정 시 503 반환
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '환율 API가 설정되지 않았습니다.' },
        { status: 503 },
      );
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from')?.toUpperCase();
    const to = searchParams.get('to')?.toUpperCase();

    if (!from || !to) {
      return NextResponse.json(
        { success: false, error: 'from과 to 파라미터는 필수입니다.' },
        { status: 400 },
      );
    }

    // 동일 통화 요청 시 1:1 반환
    if (from === to) {
      return NextResponse.json({
        success: true,
        data: { rate: 1, from, to, lastUpdated: new Date().toISOString() },
      });
    }

    // 캐시 확인
    const cacheKey = `${from}-${to}`;
    const cached = currencyCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // ExchangeRate-API v6 호출
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '환율 데이터를 가져오지 못했습니다.' },
        { status: 502 },
      );
    }

    const raw: ExchangeRateApiResponse = await response.json();

    if (raw.result !== 'success') {
      return NextResponse.json(
        { success: false, error: '환율 API에서 오류가 발생했습니다.' },
        { status: 502 },
      );
    }

    const data: CurrencyResponse = {
      rate: raw.conversion_rate,
      from: raw.base_code,
      to: raw.target_code,
      lastUpdated: new Date().toISOString(),
    };

    // 캐시 저장
    currencyCache.set(cacheKey, data);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { success: false, error: '환율 API 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
