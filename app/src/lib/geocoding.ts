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
    country_code?: string;
  }>;
}

// 한글 → 영문 도시명 매핑 (Open-Meteo가 한글 검색을 지원하지 않음)
const CITY_NAME_MAP: Record<string, string> = {
  // 일본
  '오사카': 'Osaka',
  '도쿄': 'Tokyo',
  '교토': 'Kyoto',
  '후쿠오카': 'Fukuoka',
  '삿포로': 'Sapporo',
  '나고야': 'Nagoya',
  '나라': 'Nara',
  '고베': 'Kobe',
  '히로시마': 'Hiroshima',
  '오키나와': 'Okinawa',
  '요코하마': 'Yokohama',
  '하코네': 'Hakone',
  '가마쿠라': 'Kamakura',
  // 한국
  '서울': 'Seoul',
  '부산': 'Busan',
  '제주': 'Jeju City',
  '제주도': 'Jeju City',
  '경주': 'Gyeongju',
  '강릉': 'Gangneung',
  '여수': 'Yeosu',
  '전주': 'Jeonju',
  '속초': 'Sokcho',
  '인천': 'Incheon',
  '대구': 'Daegu',
  '대전': 'Daejeon',
  '광주': 'Gwangju',
  // 동남아
  '방콕': 'Bangkok',
  '치앙마이': 'Chiang Mai',
  '푸켓': 'Phuket',
  '하노이': 'Hanoi',
  '호치민': 'Ho Chi Minh City',
  '다낭': 'Da Nang',
  '싱가포르': 'Singapore',
  '발리': 'Bali',
  '세부': 'Cebu',
  '보라카이': 'Boracay',
  '쿠알라룸푸르': 'Kuala Lumpur',
  // 중국/대만/홍콩
  '베이징': 'Beijing',
  '상하이': 'Shanghai',
  '홍콩': 'Hong Kong',
  '타이베이': 'Taipei',
  '마카오': 'Macau',
  // 유럽
  '파리': 'Paris',
  '런던': 'London',
  '로마': 'Rome',
  '바르셀로나': 'Barcelona',
  '마드리드': 'Madrid',
  '프라하': 'Prague',
  '비엔나': 'Vienna',
  '암스테르담': 'Amsterdam',
  '베를린': 'Berlin',
  '뮌헨': 'Munich',
  '취리히': 'Zurich',
  '밀라노': 'Milan',
  '피렌체': 'Florence',
  '베네치아': 'Venice',
  '리스본': 'Lisbon',
  '부다페스트': 'Budapest',
  '이스탄불': 'Istanbul',
  '아테네': 'Athens',
  '산토리니': 'Santorini',
  // 미주/오세아니아
  '뉴욕': 'New York',
  '로스앤젤레스': 'Los Angeles',
  '샌프란시스코': 'San Francisco',
  '라스베가스': 'Las Vegas',
  '하와이': 'Honolulu',
  '호놀룰루': 'Honolulu',
  '시드니': 'Sydney',
  '멜버른': 'Melbourne',
  '괌': 'Guam',
  '사이판': 'Saipan',
};

// 도시명에서 핵심 지명만 추출 ("오사카 3박 4일" → "오사카")
function extractCityName(destination: string): string {
  return destination
    .replace(/\d+박\s*\d+일/g, '')
    .replace(/여행|투어|자유여행/g, '')
    .trim()
    .split(/[\s,/]+/)[0]
    .trim();
}

// 한글 도시명을 영문으로 변환
function toEnglishCityName(koreanName: string): string {
  return CITY_NAME_MAP[koreanName] ?? koreanName;
}

// 도시명으로 위경도 조회
export async function geocode(cityName: string): Promise<GeocodingResult | null> {
  const cleaned = extractCityName(cityName);
  const cacheKey = cleaned.toLowerCase().trim();
  const cached = geocodingCache.get(cacheKey);
  if (cached) return cached;

  // 한글 → 영문 변환 후 검색
  const englishName = toEnglishCityName(cleaned);

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', englishName);
    url.searchParams.set('count', '5');
    url.searchParams.set('language', 'en');

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;

    const data: GeocodingApiResponse = await response.json();
    if (!data.results || data.results.length === 0) return null;

    // 한국/일본 등 관련 국가 결과 우선 선택
    const preferred = data.results.find(r =>
      ['KR', 'JP', 'TH', 'VN', 'SG', 'TW', 'HK', 'CN', 'PH', 'ID', 'MY',
       'FR', 'GB', 'IT', 'ES', 'DE', 'CZ', 'AT', 'NL', 'PT', 'HU', 'TR', 'GR',
       'US', 'AU', 'GU'].includes(r.country_code ?? ''),
    ) ?? data.results[0];

    const result: GeocodingResult = {
      latitude: preferred.latitude,
      longitude: preferred.longitude,
      name: preferred.name,
    };

    geocodingCache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}
