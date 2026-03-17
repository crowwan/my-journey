// ============================================================
// 날씨 API fetch 함수
// /api/weather Route Handler를 호출하는 클라이언트 코드
// ============================================================

import type { LiveWeatherDay } from '@/types/weather';

// API 응답 DTO (이 파일 안에서만 사용)
interface WeatherApiResponse {
  success: boolean;
  data?: LiveWeatherDay[];
  error?: string;
}

interface FetchWeatherParams {
  destination: string;
  startDate: string;
  endDate: string;
  fallbackCoords?: { lat: number; lng: number };
}

/**
 * 날씨 데이터를 조회하는 API fetch 함수
 * 도시명으로 먼저 시도하고, 실패 시 폴백 좌표로 재시도
 * @returns LiveWeatherDay[] 또는 에러 throw
 */
export async function fetchWeather(
  params: FetchWeatherParams,
): Promise<LiveWeatherDay[]> {
  const { destination, startDate, endDate, fallbackCoords } = params;

  // 도시명으로 먼저 시도
  const searchParams = new URLSearchParams({ startDate, endDate });
  searchParams.set('city', destination);

  let response = await fetch(`/api/weather?${searchParams.toString()}`);
  let result: WeatherApiResponse = await response.json();

  // 도시명 geocoding 실패 시 폴백 좌표로 재시도
  if (!result.success && fallbackCoords != null) {
    const fallbackParams = new URLSearchParams({
      startDate,
      endDate,
      lat: String(fallbackCoords.lat),
      lng: String(fallbackCoords.lng),
    });
    response = await fetch(`/api/weather?${fallbackParams.toString()}`);
    result = await response.json();
  }

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error ?? '날씨 데이터를 가져올 수 없습니다.');
}
