// Middleware용 Supabase 세션 갱신 헬퍼
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isMockOAuthEnabled } from '@/lib/capture-flags'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 캡처용 모킹 모드: 실 Supabase 세션 갱신을 건너뛴다.
  // 클라이언트의 useAuth가 MOCK_USER를 돌려주므로 서버 쿠키 조작도 불필요.
  if (isMockOAuthEnabled()) {
    return supabaseResponse
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 환경변수 미설정 시 세션 갱신 건너뜀
  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Auth 토큰 갱신을 위해 getUser 호출
  // 이 호출을 제거하면 세션이 만료되어도 갱신되지 않음
  await supabase.auth.getUser()

  return supabaseResponse
}
