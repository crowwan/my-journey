// ============================================================
// 프롬프트 빌더
// Quick Setup 폼 데이터를 AI 프롬프트 텍스트로 변환
// ============================================================

import { diffDays } from '@/lib/date-utils';

interface QuickSetupData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
}

/**
 * Quick Setup 폼 데이터를 AI 프롬프트 텍스트로 조립한다
 */
export function buildQuickSetupPrompt(data: QuickSetupData): string {
  const trimmed = data.destination.trim();
  const days = diffDays(data.startDate, data.endDate) + 1;
  const nights = days - 1;
  const durationStr = nights > 0 ? `${nights}박 ${days}일` : '당일치기';

  return `목적지: ${trimmed}, 기간: ${data.startDate} ~ ${data.endDate} (${durationStr}), 인원: ${data.travelers}명. 여행 계획을 생성해주세요.`;
}
