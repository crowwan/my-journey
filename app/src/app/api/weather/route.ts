// ============================================================
// 날씨 API Route — Open-Meteo Forecast API
// GET /api/weather?city=osaka&startDate=2026-03-20&endDate=2026-03-25
// 또는 GET /api/weather?lat=34.69&lng=135.50&startDate=...&endDate=...
// ============================================================

import { NextResponse } from 'next/server';
import { createCache } from '@/lib/api-cache';
import { geocode } from '@/lib/geocoding';
import { getWeatherInfo, getDayOfWeek } from '@/lib/weather-utils';

// 날씨 응답 타입
interface WeatherDayResponse {
  date: string;
  dayOfWeek: string;
  icon: string;
  description: string;
  tempHigh: number;
  tempLow: number;
  tempAvg: number;
  precipitationProbability: number;
}

// Open-Meteo 응답 타입
interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}

// 1시간 캐시
const weatherCache = createCache<WeatherDayResponse[]>(60 * 60 * 1000);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    let lat = searchParams.get('lat');
    let lng = searchParams.get('lng');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'startDate와 endDate는 필수입니다.' },
        { status: 400 },
      );
    }

    // geocoding: 도시명이 있으면 좌표 변환
    if (!lat || !lng) {
      if (!city) {
        return NextResponse.json(
          { success: false, error: 'city 또는 lat/lng가 필요합니다.' },
          { status: 400 },
        );
      }
      const geo = await geocode(city);
      if (!geo) {
        return NextResponse.json(
          { success: false, error: `"${city}"의 좌표를 찾을 수 없습니다.` },
          { status: 404 },
        );
      }
      lat = String(geo.latitude);
      lng = String(geo.longitude);
    }

    // 캐시 확인
    const cacheKey = `${lat},${lng}`;
    const cached = weatherCache.get(cacheKey);
    if (cached) {
      // 캐시 데이터에서 요청 기간만 필터링
      const filtered = filterByDateRange(cached, startDate, endDate);
      return NextResponse.json({ success: true, data: filtered });
    }

    // Open-Meteo API 호출 (16일 예보)
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat);
    url.searchParams.set('longitude', lng);
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_probability_max,weathercode');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '16');

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: '날씨 데이터를 가져오지 못했습니다.' },
        { status: 502 },
      );
    }

    const raw: OpenMeteoResponse = await response.json();
    const days = raw.daily.time.map((date, i) => {
      const weather = getWeatherInfo(raw.daily.weathercode[i]);
      return {
        date,
        dayOfWeek: getDayOfWeek(date),
        icon: weather.emoji,
        description: weather.description,
        tempHigh: Math.round(raw.daily.temperature_2m_max[i]),
        tempLow: Math.round(raw.daily.temperature_2m_min[i]),
        tempAvg: Math.round(raw.daily.temperature_2m_mean[i]),
        precipitationProbability: raw.daily.precipitation_probability_max[i],
      };
    });

    // 전체 16일 캐시
    weatherCache.set(cacheKey, days);

    // 요청 기간만 필터링하여 반환
    const filtered = filterByDateRange(days, startDate, endDate);
    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { success: false, error: '날씨 API 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// 날짜 범위로 필터링
function filterByDateRange(
  days: WeatherDayResponse[],
  startDate: string,
  endDate: string,
): WeatherDayResponse[] {
  return days.filter((d) => d.date >= startDate && d.date <= endDate);
}
