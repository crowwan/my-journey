// ============================================================
// Open-Meteo Geocoding API — 도시명 -> 위경도 변환
// 24시간 TTL 인메모리 캐시 적용
// ============================================================

import { createCache } from './api-cache';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}

// 24시간 캐시 (도시 좌표는 변하지 않음)
const geocodingCache = createCache<GeocodingResult>(24 * 60 * 60 * 1000);

// Open-Meteo Geocoding API 응답 타입
interface GeocodingApiResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
}

// 도시명으로 위경도 조회
export async function geocode(cityName: string): Promise<GeocodingResult | null> {
  const cacheKey = cityName.toLowerCase().trim();
  const cached = geocodingCache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', cityName);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;

    const data: GeocodingApiResponse = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const result: GeocodingResult = {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name,
    };

    geocodingCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}
