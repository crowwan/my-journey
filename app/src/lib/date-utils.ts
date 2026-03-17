// ============================================================
// 날짜 유틸리티 함수
// 오늘 날짜, 날짜 비교, 포맷팅 (한글/범위/시간)
// ============================================================

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환한다 (로컬 시간 기준)
 */
export function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 날짜 문자열이 오늘인지 확인한다
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}

/**
 * 날짜를 한글 짧은 형식으로 변환한다
 * 예: "2026-03-15" -> "3월 15일"
 */
export function formatDateKR(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/**
 * 날짜 범위를 한글 형식으로 변환한다
 * 예: "3월 15일 ~ 3월 20일"
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const fmt = (d: Date) =>
    d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  return `${fmt(start)} ~ ${fmt(end)}`;
}

/**
 * 타임스탬프를 HH:MM 형식으로 변환한다
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * 두 날짜 간 차이를 일 수로 계산한다
 */
export function diffDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}
