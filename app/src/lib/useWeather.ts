// ============================================================
// 실시간 날씨 데이터 fetch 커스텀 훅
// useWeather(destination, startDate, endDate, fallbackCoords?)
// ============================================================

import { useState, useEffect } from 'react';

// 날씨 일별 데이터 타입
export interface LiveWeatherDay {
  date: string;
  dayOfWeek: string;
  icon: string;
  description: string;
  tempHigh: number;
  tempLow: number;
  tempAvg: number;
  precipitationProbability: number;
}

interface UseWeatherResult {
  data: LiveWeatherDay[] | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface FallbackCoords {
  lat: number;
  lng: number;
}

// API 응답 타입
interface WeatherApiResponse {
  success: boolean;
  data?: LiveWeatherDay[];
  error?: string;
}

export function useWeather(
  destination: string,
  startDate: string,
  endDate: string,
  fallbackCoords?: FallbackCoords,
): UseWeatherResult {
  const [data, setData] = useState<LiveWeatherDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 폴백 좌표를 안정적인 값으로 추출 (참조 동일성 문제 방지)
  const fbLat = fallbackCoords?.lat;
  const fbLng = fallbackCoords?.lng;

  useEffect(() => {
    // 필수 파라미터 확인
    if (!destination || !startDate || !endDate) {
      setLoading(false);
      setError('날씨 조회에 필요한 정보가 부족합니다.');
      return;
    }

    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        // 도시명으로 먼저 시도
        const params = new URLSearchParams({ startDate, endDate });
        params.set('city', destination);

        let response = await fetch(`/api/weather?${params.toString()}`);
        let result: WeatherApiResponse = await response.json();

        // 도시명 geocoding 실패 시 폴백 좌표로 재시도
        if (!result.success && fbLat != null && fbLng != null) {
          const fallbackParams = new URLSearchParams({
            startDate,
            endDate,
            lat: String(fbLat),
            lng: String(fbLng),
          });
          response = await fetch(`/api/weather?${fallbackParams.toString()}`);
          result = await response.json();
        }

        if (cancelled) return;

        if (result.success && result.data) {
          setData(result.data);
          setLastUpdated(new Date());
        } else {
          setError(result.error ?? '날씨 데이터를 가져올 수 없습니다.');
        }
      } catch {
        if (!cancelled) {
          setError('날씨 데이터를 가져올 수 없습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [destination, startDate, endDate, fbLat, fbLng]);

  return { data, loading, error, lastUpdated };
}
