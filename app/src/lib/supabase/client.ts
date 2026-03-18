// 브라우저 환경용 Supabase 클라이언트 (싱글턴)
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 빌드 시 프리렌더링에서 환경변수가 없을 수 있음
  if (!url || !key) {
    // 더미 URL로 생성 — SSR 프리렌더 시에만 도달하며, 실제 요청은 발생하지 않음
    return createBrowserClient('http://localhost', 'dummy-key')
  }

  client = createBrowserClient(url, key)

  return client
}
