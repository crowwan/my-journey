// 인증 상태 관리 React Query hooks
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useChatStore } from '@/stores/useChatStore'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export const AUTH_QUERY_KEY = ['auth', 'user'] as const

// 현재 로그인 사용자 정보 조회
// getSession()으로 로컬 세션을 먼저 체크하여 새로고침 시 즉시 인증 상태 복원
export function useAuth() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // 로그인/로그아웃 상태 변화를 감지하여 캐시 즉시 업데이트
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // 세션 변경 시 즉시 캐시 업데이트 (invalidate 대신 setQueryData로 빠르게 반영)
          const user = session?.user ?? null
          queryClient.setQueryData([...AUTH_QUERY_KEY], user)
          // 로그인 상태 변경 시 trips 캐시도 무효화
          queryClient.invalidateQueries({ queryKey: ['trips'] })
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase, queryClient])

  return useQuery({
    queryKey: [...AUTH_QUERY_KEY],
    queryFn: async (): Promise<User | null> => {
      // getSession()은 로컬 저장소에서 세션을 읽어 서버 호출 없이 빠르게 반환
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user ?? null
    },
    staleTime: 1000 * 30, // 30초 — 매 렌더마다 서버 호출 방지
    gcTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// 카카오 소셜 로그인
export function useSignInWithKakao() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    },
  })
}

// 로그아웃
export function useSignOut() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      // 로그아웃 시 채팅 대화 내용 초기화
      useChatStore.getState().clearMessages()
    },
  })
}
