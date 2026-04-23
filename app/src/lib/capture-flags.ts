// ============================================================
// 캡처 파이프라인용 모킹 토글
// vibe-videos Playwright 캡처 시 외부 API(Gemini, Kakao OAuth) 호출을 건너뛰기 위한 환경변수 스위치.
// 실제 .env.local이나 .env.capture로 주입된다.
// ============================================================

/**
 * 카카오 OAuth 우회 여부
 * NEXT_PUBLIC_MOCK_OAUTH=1 일 때 고정 데모 유저로 로그인 상태를 흉내낸다.
 * 클라이언트 번들에도 주입되어야 하므로 NEXT_PUBLIC_ 접두사 사용.
 */
export function isMockOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_OAUTH === '1';
}

/**
 * Gemini 호출 우회 여부
 * NEXT_PUBLIC_MOCK_LLM=1 또는 MOCK_LLM=1 일 때 스텁 응답을 반환한다.
 * 서버 라우트(/api/chat)에서만 호출되지만, 서버 사이드 플래그(MOCK_LLM)도 함께 지원해
 * 클라이언트에 노출 없이 모킹을 켤 수 있도록 한다.
 */
export function isMockLlmEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_MOCK_LLM === '1' ||
    process.env.MOCK_LLM === '1'
  );
}

/**
 * 모킹 모드에서 사용하는 고정 유저 ID
 * Supabase의 auth.users 테이블과는 독립적이며, 캡처 중에만 유효.
 */
export const MOCK_USER_ID = 'mock-user-id';
export const MOCK_USER_EMAIL = 'demo@example.com';
export const MOCK_USER_NAME = '데모 사용자';
