// ============================================================
// WMO Weather Interpretation Codes -> 이모지/설명 매핑
// Open-Meteo API의 weathercode 필드에 대응
// https://open-meteo.com/en/docs#weathervariables
// ============================================================

interface WeatherInfo {
  emoji: string;
  description: string;
}

// WMO 날씨 코드 매핑 테이블
const WMO_CODE_MAP: Record<number, WeatherInfo> = {
  // 맑음
  0: { emoji: '☀️', description: '맑음' },
  // 구름
  1: { emoji: '🌤️', description: '대체로 맑음' },
  2: { emoji: '⛅', description: '구름 조금' },
  3: { emoji: '☁️', description: '흐림' },
  // 안개
  45: { emoji: '🌫️', description: '안개' },
  48: { emoji: '🌫️', description: '안개 (서리)' },
  // 이슬비
  51: { emoji: '🌧️', description: '약한 이슬비' },
  53: { emoji: '🌧️', description: '이슬비' },
  55: { emoji: '🌧️', description: '강한 이슬비' },
  // 어는 이슬비
  56: { emoji: '🌧️', description: '약한 어는 이슬비' },
  57: { emoji: '🌧️', description: '강한 어는 이슬비' },
  // 비
  61: { emoji: '🌧️', description: '약한 비' },
  63: { emoji: '🌧️', description: '비' },
  65: { emoji: '🌧️', description: '강한 비' },
  // 어는 비
  66: { emoji: '🌧️', description: '약한 어는 비' },
  67: { emoji: '🌧️', description: '강한 어는 비' },
  // 눈
  71: { emoji: '❄️', description: '약한 눈' },
  73: { emoji: '❄️', description: '눈' },
  75: { emoji: '❄️', description: '강한 눈' },
  77: { emoji: '🌨️', description: '눈 알갱이' },
  // 소나기
  80: { emoji: '🌦️', description: '약한 소나기' },
  81: { emoji: '🌦️', description: '소나기' },
  82: { emoji: '🌦️', description: '강한 소나기' },
  // 눈 소나기
  85: { emoji: '🌨️', description: '약한 눈 소나기' },
  86: { emoji: '🌨️', description: '강한 눈 소나기' },
  // 뇌우
  95: { emoji: '⛈️', description: '뇌우' },
  96: { emoji: '⛈️', description: '약한 우박 뇌우' },
  99: { emoji: '⛈️', description: '강한 우박 뇌우' },
};

// WMO 코드 -> 날씨 정보 변환
export function getWeatherInfo(code: number): WeatherInfo {
  return WMO_CODE_MAP[code] ?? { emoji: '🌤️', description: '알 수 없음' };
}

// 요일 문자열 변환 (ISO 날짜 -> 한글 요일)
export function getDayOfWeek(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}
