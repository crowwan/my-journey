// ============================================================
// 채팅 API fetch 함수
// /api/chat Route Handler를 호출하는 클라이언트 코드
// ============================================================

import type { ChatMessage, Trip } from '@/types/trip';

// API 응답 DTO (이 파일 안에서만 사용)
interface ChatApiResponse {
  success: boolean;
  message?: string;
  trip?: Trip;
  error?: string;
}

// 외부에 노출하는 반환 타입
export interface ChatResult {
  message: string;
  trip?: Trip;
}

/**
 * 채팅 메시지를 전송하는 API fetch 함수
 * @returns ChatResult 또는 에러 throw
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  mode: 'chat' | 'create' | 'edit',
  tripContext?: Trip,
): Promise<ChatResult> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      mode,
      tripContext,
    }),
  });

  const data: ChatApiResponse = await res.json();

  if (!data.success) {
    throw new Error(data.error ?? 'AI 응답 실패');
  }

  return {
    message: data.message ?? '',
    trip: data.trip,
  };
}
