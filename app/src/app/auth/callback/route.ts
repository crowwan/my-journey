// Supabase OAuth 콜백 핸들러
// 소셜 로그인 후 code를 세션으로 교환하고 홈으로 리다이렉트
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/`)
}
