// ============================================================
// 날씨 관련 타입 정의
// ============================================================

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
